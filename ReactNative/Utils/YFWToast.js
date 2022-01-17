
import Toast from 'react-native-root-toast'
import YFWNativeManager from "./YFWNativeManager";
import {Platform} from "react-native";

export default function (msg, options = options || { duration: 1500, position: Toast.positions.CENTER, backgroundColor: "rgba(0,0,0,.8)" }) {

    if (Platform.OS === 'android') {
        YFWNativeManager.showToast(msg);
        return
    }

    return Toast.show(msg, {duration: 1500, position: Toast.positions.CENTER , backgroundColor: "rgba(0,0,0,.8)",...options});

}

export  function loading (msg, options =
    {duration:1500 , backgroundColor:"rgba(0,0,0,.8)"}) {
    return Toast.show(msg,options);
}