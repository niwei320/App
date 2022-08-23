package com.yaofangwang.mall.net;

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Message;

import com.yaofangwang.mall.TUtils.SPUtils;
import com.yaofangwang.mall.utils.LoggerUtil;
import com.yaofangwang.mall.utils.UserInfoManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;

import static com.yaofangwang.mall.net.Utils.getSignData;
import static com.yaofangwang.mall.net.Utils.hashBytes;
import static com.yaofangwang.mall.net.Utils.jsonByMap;
import static com.yaofangwang.mall.net.Utils.mapToByte;

/**
 * Created by hxk on 2018/1/18.
 * todo: 使用传参代替变量初始化 消去synchronized
 */

public class TcpUtils {

    final int RE_TIMEOUT = 400;//网络超时
    final int RE_INTERRUPTION = 500;//网路中断
    final int RE_OTHER = 600; //其他异常
    private int retryCount = 0; //重试次数
    private Map<String, Object> params;

    OnResponseListener onResponseListener;
    private static SSLSocketFactory sslFactory;
    //        SSLSocket socket = null;
    private ExecutorService mThreadPool = Executors.newCachedThreadPool();
    private Context mContext;
    private long sendTime = 0; //请求发送时间
    private String __cmd = ""; //接口名

    public TcpUtils(Context context) {
        this.mContext = context;
    }

    /**
     * 构造静态SSL工厂
     *
     * @return
     */
    private static SSLSocketFactory getSSLFactory() {
        if (sslFactory == null) {
            SSLContext ctx;
            try {
                ctx = SSLContext.getInstance("SSL");
                ctx.init(null, new TrustManager[]{new TrustingX509TrustManager()}, new SecureRandom());
                sslFactory = ctx.getSocketFactory();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return sslFactory;
    }

    /**
     * 构造SSLSocket
     *
     * @param host
     * @param port
     * @return
     */
    public Socket createSSLSocket(String host, int port) {
        Socket socket = null;
        try {
            socket = getSSLFactory().createSocket();
            setSocket(socket, host, port);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (socket == null) {
                socket = new Socket();
                setSocket(socket, host, port);
            }
            return socket;
        }
    }

    /**
     * 构造普通socket
     *
     * @param host
     * @param port
     * @return
     */
    public Socket createSocket(String host, int port) {
        Socket socket = new Socket();
        return setSocket(socket, host, port);
    }

    /**
     * 设置socket
     *
     * @param so
     * @param host
     * @param port
     * @return
     */
    private Socket setSocket(Socket so, String host, int port) {
        try {
            if (so == null) {
                so = new Socket();
            }
            so.connect(new InetSocketAddress(host, port));
            so.setSoTimeout(10000);
            so.setTcpNoDelay(false);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return so;
    }

    /**
     * 请求，转换数据并发送
     *
     * @param params
     * @param listener
     */
    public void sendMessage(final Map<String, Object> params, final OnResponseListener listener) {
        this.onResponseListener = listener;
        Map<String, Object> baseParam = UserInfoManager.getBaseParam();
        params.putAll(baseParam);
        this.params = params;
        __cmd = (String) params.get("__cmd");
        mThreadPool.execute(new Runnable() {
            @Override
            public void run() {
                byte[] bytes = null;
                Map<String, Object> mHashMap = ProjectGlaobleParams.addGloableParams(params);
                byte[] mapBytes = mapToByte(mHashMap);
                byte[] md5FeatureCode = hashBytes(mapBytes);
                ByteArrayOutputStream bts = new ByteArrayOutputStream();
                try {
                    bts.write(ByteBuffer.allocate(4).putInt(ProjectGlaobleParams.DB_ID).array());
                    bts.write(ByteBuffer.allocate(4).putInt(ProjectGlaobleParams.BUNDLE_ID).array());
                    bts.write(ByteBuffer.allocate(4).putInt(ProjectGlaobleParams.VERSION_ID).array());
                    long timestamp = System.currentTimeMillis();
                    byte[] timestampArray = ByteBuffer.allocate(8).putLong(timestamp).array();
                    bts.write(timestampArray);
            /*写入数据的MD5码*/
                    bts.write(md5FeatureCode);
            /*添加12个空字节*/
                    bts.write(new byte[12]);
            /*数据，时间，秘钥一起签名*/
                    byte[] signData = getSignData(md5FeatureCode, timestampArray, ProjectGlaobleParams.SECRET.getBytes());
                    bts.write(signData);
                    bts.write(mapBytes);
                    bytes = bts.toByteArray();
                    bts.close();
                } catch (IOException e) {
                    if (onResponseListener != null) {
                        onResponseListener.onError(e.getMessage());
                    }
                    e.printStackTrace();
                }

                sendTime = System.currentTimeMillis();
                LoggerUtil.log(mContext, __cmd, "", false);
                getMessage(bytes);
            }
        });
    }

    /**
     * 发送数据并接受
     */
    public synchronized void getMessage(byte[] bytes) {
        if (retryCount >= 1) {
            senErrorMessage(1, -1, "服务器访问异常");
            return;
        }
        DataInputStream dis = null;
        OutputStream os = null;
        Socket socket = null;
        Message msg = Message.obtain();
        msg.what = 0;
        try {
            /*SSL请求*/
//            if(BuildConfig.DEBUG){
//                SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, MainApplication.getInstance().MODE_PRIVATE);
//                String ipAddress = sharedPreferences.getString("Debug_IP_Address", "onLine");
//                if("onLine".equals(ipAddress)){
//                    socket = createSocket(ProjectGlaobleParams.IP, ProjectGlaobleParams.TCP_PORT);
//                }else {
//                    socket = createSocket(ProjectGlaobleParams.IP, ProjectGlaobleParams.TCP_PORT);
//                }
//
//            }else {
//                socket = createSocket(ProjectGlaobleParams.IP, ProjectGlaobleParams.TCP_PORT);
//            }
            if(SPUtils.getIpAddress().equals("onLineTest") || SPUtils.getIpAddress().equals("onLine")){
                socket = createSSLSocket(ProjectGlaobleParams.IP, ProjectGlaobleParams.TCP_PORT);
            } else {
                socket = createSocket(ProjectGlaobleParams.IP, ProjectGlaobleParams.TCP_PORT);
            }
            if (socket.isConnected()) {
                os = socket.getOutputStream();
                int length = bytes.length;
                os.write(ByteBuffer.allocate(4).putInt(length).array());
                os.write(bytes);
                os.flush();
            } else {
                socket = null;
            }

            //连接错误/超时等情况/暂且定义超时
            if (null == socket) {
                LoggerUtil.e("服务访问异常");
                closeSocket(socket);
                retry();
                return;
            }


            dis = new DataInputStream(socket.getInputStream());

            int len = 0;
            byte[] buf = new byte[4];
            dis.readFully(buf, 0, 4);
            len = ByteBuffer.wrap(buf).getInt();

            /**
             * 数据获取异常
             */
            if(len <= 0 || len > 1024*1024*10){
                LoggerUtil.e("数据获取异常长度: " + len);
                closeSocket(socket);
                closeObj(dis);
                retry();
                return;
            }

            buf = new byte[len];
            dis.readFully(buf, 0, len);
            ByteBuffer buffer = ByteBuffer.wrap(buf, 0, buf.length);

            int jsonLen = buffer.getInt();
            byte[] jsonData = new byte[jsonLen];
            buffer.get(jsonData);

            String jsonStr = new String(jsonData);

            getHeadKV(buffer);
            msg.obj = jsonStr;
        } catch (SocketTimeoutException e) {
            LoggerUtil.e("连接超时");
            closeSocket(socket);
            retry();
            return;
        } catch (SocketException e) {
            LoggerUtil.e("连接超时");
            closeSocket(socket);
            retry();
            return;
        } catch (Exception e) {
            LoggerUtil.e("连接超时");
            closeSocket(socket);
            retry();
            return;
        }
        closeSocket(socket);
        closeObj(dis);
        closeObj(os);
        mmMainHandler.sendMessage(msg);
    }

    /**
     * 获取服务器传递的Key Value
     *
     * @param buffer
     */
    private void getHeadKV(ByteBuffer buffer) {
        int paramLen = buffer.getInt();
        for (int i = 0; i < paramLen; i++) {
            int keyLen = buffer.getInt();
            if (keyLen <= 0)
                continue;
            byte[] bts = new byte[keyLen];
            buffer.get(bts);
            String key = new String(bts);

            int valLen = buffer.getInt();
            if (valLen <= 0)
                continue;
            bts = new byte[valLen];
            buffer.get(bts);
            String val = new String(bts);
            saveKeyValue(key, val);

        }
    }

    /**
     * 保存Key value
     *
     * @param key
     * @param val
     */
    private void saveKeyValue(String key, String val) {
        if ("ssid".equals(key)) {
            ProjectGlaobleParams.saveSSID(val);
        }
        //多种类型继续ifelse
    }

    private int requestType = 1;
    private boolean isFrist = true;
    private int sendMaxSize = 1024 * 250;
    int start = 0;
    int limit = 1024 * 250;
    int available;

    private byte[] image2Bytes(String imgSrc, String imgName) throws Exception {

        FileInputStream fin = new FileInputStream(new File(imgSrc));
        available = fin.available();//文件大小
        ByteArrayOutputStream bts = new ByteArrayOutputStream();

        byte[] bytes = new byte[available];
        fin.read(bytes);
        /*type*/
        bts.write(ByteBuffer.allocate(4).putInt(requestType).array());
        /*file size*/
        bts.write(ByteBuffer.allocate(4).putInt(available).array());
        /*fileid len*/
//        bts.write(ByteBuffer.allocate(4).putInt(0).array());
        bts.write(ByteBuffer.allocate(4).putInt(imgName.getBytes().length).array());
        /*fileId*/
        bts.write(imgName.getBytes());
        /*feature code，计算文件的MD5码，超过4M取前后2M，小于4M全部读取*/
        if (hashBytes(bytes).length > 4096) {
            byte[] bytes1 = new byte[4096];
            System.arraycopy(bytes, 0, bytes1, 0, 2048);
            System.arraycopy(bytes, bytes.length - 2048, bytes1, 2048, 2048);
            bts.write(hashBytes(bytes1));
        } else {
            bts.write(hashBytes(bytes));
        }

        if (available < sendMaxSize) {
            limit = available;
            byte[] maxByte = new byte[limit];
            System.arraycopy(bytes, start, maxByte, 0, maxByte.length);
            bts.write(ByteBuffer.allocate(4).putInt(start).array());
            bts.write(ByteBuffer.allocate(4).putInt(limit).array());
            bts.write(ByteBuffer.allocate(4).putInt(maxByte.length).array());
            bts.write(maxByte);
        } else {
            if (available - start < limit) {
                limit = available - start;
            }
            byte[] maxByte = new byte[limit];
            System.arraycopy(bytes, start, maxByte, 0, maxByte.length);

            bts.write(ByteBuffer.allocate(4).putInt(start).array());
            bts.write(ByteBuffer.allocate(4).putInt(limit).array());
            bts.write(ByteBuffer.allocate(4).putInt(maxByte.length).array());
            bts.write(maxByte);
            start += limit;
        }

        fin.close();
        bts.close();

        return bts.toByteArray();
    }

    String img;
    String name;
    int diskId;

    public void buildDataPackage(Integer diskid, String imgUrl, String imgName, OnResponseListener listener) {
        this.onResponseListener = listener;
        this.img = imgUrl;
        this.name = imgName;
        this.diskId = diskid;
        if (isFrist) {
            requestType = 0;
            isFrist = false;
        } else {
            requestType = 1;
        }
        mThreadPool.execute(new Runnable() {
            @Override
            public void run() {
                byte[] mBytes = null;
                ByteArrayOutputStream bts = new ByteArrayOutputStream();
                try {
                    bts.write(ByteBuffer.allocate(4).putInt(diskid).array());
                    bts.write(ByteBuffer.allocate(4).putInt(ProjectGlaobleParams.BUNDLE_ID).array());
                    bts.write(ByteBuffer.allocate(4).putInt(ProjectGlaobleParams.VERSION_ID).array());
                    byte[] timestampArray = ByteBuffer.allocate(8).putLong(System.currentTimeMillis()).array();
                    bts.write(timestampArray);

                    byte[] bytes = image2Bytes(imgUrl, imgName);
                    byte[] featureCodeByte = hashBytes(bytes);
                    bts.write(featureCodeByte);

                    bts.write(ByteBuffer.allocate(12).array());
                    byte[] signData = getSignData(featureCodeByte, timestampArray, ProjectGlaobleParams.SECRET.getBytes());
                    bts.write(signData);
                    if (!isFrist) {
                        bts.write(bytes);
                    }
                    mBytes = bts.toByteArray();
                    bts.close();
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                postImg(mBytes);
            }
        });
    }

    private void postImg(byte[] bytes) {
        Message msg = Message.obtain();
        DataInputStream dis = null;
        Socket socket = null;
        try {
            /*SSL请求*/
            socket = createSSLSocket(ProjectGlaobleParams.IMG_IP, ProjectGlaobleParams.IMG_PORT);
            /*Test 不包含SSL*/
//            socket = createSocket(ProjectGlaobleParams.IMG_IP, ProjectGlaobleParams.IMG_PORT);

            if (socket.isConnected()) {
                OutputStream os = socket.getOutputStream();
                int length = bytes.length;
                os.write(ByteBuffer.allocate(4).putInt(length).array());
                os.write(bytes);
                os.flush();
            }else{
                msg.what = 1;
                msg.obj = jsonByMap(RE_TIMEOUT, "服务访问异常");
                closeSocket(socket);
                return;
            }

            //连接错误/超时等情况/暂且定义超时
            if (null == socket) {
                msg.what = 1;
                msg.obj = jsonByMap(RE_TIMEOUT, "服务访问异常");
                closeSocket(socket);
                return;
            }


            dis = new DataInputStream(socket.getInputStream());

            int len = 0;
            byte[] buf = new byte[4];
            dis.readFully(buf, 0, 4);
            len = ByteBuffer.wrap(buf).getInt();

            /**
             * 数据获取异常
             */
            if (len <= 0) {
                LoggerUtil.e("数据获取异常长度 = 0");
                closeSocket(socket);
                closeObj(dis);
                retry();
                return;
            }

            buf = new byte[len];
            dis.readFully(buf, 0, len);
            ByteBuffer buffer = ByteBuffer.wrap(buf, 0, buf.length);


            //读4个字节获取状态
            byte[] bb2 = new byte[4];
            buffer.get(bb2);
            ByteBuffer buffer2 = ByteBuffer.wrap(bb2);
            int type = buffer2.getInt();//状态

            if (type == 22 || type == 11) {//上传完成  //文件存在
                //读4个字节获取文件地址大小
                byte[] fileSizeByte = new byte[4];
                buffer.get(fileSizeByte);
                //读4个字节获取文件路径长度
                byte[] filePathLenByte = new byte[4];
                buffer.get(filePathLenByte);
                ByteBuffer buffer3 = ByteBuffer.wrap(filePathLenByte);
                int filePathLength = buffer3.getInt();
                //读文件路径长度
                byte[] filePathByte = new byte[filePathLength];
                buffer.get(filePathByte);
                //图片地址
                String path = new String(filePathByte);
                msg.what = 2;
                msg.obj = path;
                mmMainHandler.sendMessage(msg);
            } else if (type == 20) {//上传失败
                senErrorMessage(1, -1, "上传失败");
                closeSocket(socket);
            } else if (type == 10 || type == 21) {//文件不存在  //上传成功
                buildDataPackage(diskId, img, name, onResponseListener);
            } else {
                senErrorMessage(1, -1, "上传失败");
                closeSocket(socket);
            }
        } catch (IOException e) {
            senErrorMessage(1, -1, "上传失败");
            closeSocket(socket);
        } catch (Exception e) {
            senErrorMessage(1, -1, "上传失败");
            closeSocket(socket);
        } finally {
            closeObj(dis);
            closeSocket(socket);
        }
    }

    private void senErrorMessage(int what, int code, String m) {
        Message msg = Message.obtain();
        msg.what = what;
        msg.obj = jsonByMap(code, m);
        mmMainHandler.sendMessage(msg);
    }

    /**
     * 关闭可关闭的对象
     *
     * @param closeable
     */
    private void closeObj(Closeable closeable) {
        if (closeable == null) {
            return;
        }
        try {
            closeable.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 关闭socket
     *
     * @param socket
     */
    private void closeSocket(Socket socket) {
        try {
            if (socket != null && !socket.isClosed())
                socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 重试
     */
    public void retry() {
        retryCount++;
        String name = Thread.currentThread().getName();
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        sendMessage(params, onResponseListener);
    }

    /**
     * Handler消息处理
     * 0 正确回调
     * 1 错误回调
     * 2 图片回调
     */
    private Handler mmMainHandler = new Handler() {
        @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
        @Override
        public void handleMessage(Message msg) {
            if (mContext == null) {
                return;
            }
            switch (msg.what) {
                case 0:
                    setReturn(msg);
                    break;
                case 1:
                    String obj = (String) msg.obj;
                    onResponseListener.onError(obj);
                    break;
                case 2:
                    onResponseListener.onResponse((String) msg.obj);
                    break;
            }
        }
    };

    /**
     * 回调数据
     *
     * @param msg
     */
    private void setReturn(Message msg) {
        String obj = (String) msg.obj;
        try {
            //  Log.d("TCP--REQUEST", obj);
            JSONObject result = new JSONObject(obj);
            if ("1".equals(result.getString("code"))) {
                //因为要RN需要获取到SSID，所以统一返回SSID给RN
                result.putOpt("ssid", ProjectGlaobleParams.getSSID());
                onResponseListener.onResponse(result.toString());
            } else {
                onResponseListener.onError((String) msg.obj);
            }
        } catch (JSONException e) {
            onResponseListener.onError("请求数据错误 obj = " + obj);
        }
        LoggerUtil.log(mContext, __cmd, System.currentTimeMillis() - sendTime + "s", true);
    }


    public interface OnResponseListener {
        void onResponse(String s);

        void onError(String s);
    }
}
