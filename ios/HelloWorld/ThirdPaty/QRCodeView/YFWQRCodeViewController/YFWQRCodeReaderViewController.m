//
//  YFWQRCodeReaderViewController.m
//  YaoFang
//
//  Created by 姜明均 on 2017/5/26.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import "YFWQRCodeReaderViewController.h"
#import "YFWQRCameraSwitchButton.h"
#import "YFWQRCodeReaderView.h"
#import "ZXingObjC.h"

#define mainHeight     [[UIScreen mainScreen] bounds].size.height
#define mainWidth      [[UIScreen mainScreen] bounds].size.width
#define navBarHeight   self.navigationController.navigationBar.frame.size.height

@interface YFWQRCodeReaderViewController () <ZXCaptureDelegate,UIImagePickerControllerDelegate,UINavigationControllerDelegate>
//@property (strong, nonatomic) QRCodeReaderView     *cameraView;
@property (strong, nonatomic) AVAudioPlayer        *beepPlayer;
@property (strong, nonatomic) UIButton             *cancelButton;
@property (strong, nonatomic) UIImageView          *imgLine;
@property (strong, nonatomic) UILabel              *lblTip;
@property (strong, nonatomic) NSTimer              *timerScan;

@property (assign, nonatomic) BOOL isOver;
@property (assign, nonatomic) float startY;
@property (assign, nonatomic) float endY;

@property (strong, nonatomic) CIDetector *detector;
@property (nonatomic, strong) ZXCapture *capture;

@property (copy, nonatomic) void (^completionBlock) (NSString *);

@end

@implementation YFWQRCodeReaderViewController{
    CGAffineTransform _captureSizeTransform;
}
RCT_EXPORT_MODULE();
- (id)init
{
    NSString * wavPath = [[NSBundle mainBundle] pathForResource:@"beep" ofType:@"wav"];
    NSData* data = [[NSData alloc] initWithContentsOfFile:wavPath];
    _beepPlayer = [[AVAudioPlayer alloc] initWithData:data error:nil];
    
    return [self initWithCancelButtonTitle:NSLocalizedString(@"Cancel", @"Cancel")];
}

- (id)initWithCancelButtonTitle:(NSString *)cancelTitle
{
    if ((self = [super init])) {
        self.view.backgroundColor = [UIColor blackColor];
        
        [self setupUIComponentsWithCancelButtonTitle:cancelTitle];
        
    }
    return self;
}

+ (instancetype)readerWithCancelButtonTitle:(NSString *)cancelTitle
{
    return [[self alloc] initWithCancelButtonTitle:cancelTitle];
}

- (void)dealloc{
  
  NSLog(@"释放扫一扫");
  
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.title = @"扫一扫";
  
    UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"backgreen"] style:UIBarButtonItemStylePlain target:self action:@selector(backMethod)];
    self.navigationItem.leftBarButtonItem = leftBarButtonItem;
}

- (void)allStop{
  
  [self stopScanning];
  self.isOver = YES;
  
}

- (void)backMethod{
    [self allStop];
    [self.navigationController popViewControllerAnimated:YES];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    self.navigationController.navigationBarHidden = NO;
    self.capture.delegate = self;
    [self startScanning];
    [self.capture start];
    [self applyOrientation];
    
    if ([self.navigationController respondsToSelector:@selector(interactivePopGestureRecognizer)]) {
        self.navigationController.interactivePopGestureRecognizer.enabled = NO;
    }
    
}
 
- (void)viewWillDisappear:(BOOL)animated{
    [self stopScanning];
    [self.capture stop];
    [super viewWillDisappear:animated];
    self.navigationController.navigationBarHidden = YES;
    if ([self.navigationController respondsToSelector:@selector(interactivePopGestureRecognizer)]) {
        self.navigationController.interactivePopGestureRecognizer.enabled = YES;
    }
    if (_delegate && [_delegate respondsToSelector:@selector(clearRender)]) {
      [_delegate clearRender];
    }
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation {
    return toInterfaceOrientation == UIInterfaceOrientationPortrait;
}

- (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation {
    [super didRotateFromInterfaceOrientation:fromInterfaceOrientation];
    [self applyOrientation];
}

- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id <UIViewControllerTransitionCoordinator>)coordinator {
    [super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
    [coordinator animateAlongsideTransition:^(id<UIViewControllerTransitionCoordinatorContext> context) {
    } completion:^(id<UIViewControllerTransitionCoordinatorContext> context)
     {
         [self applyOrientation];
     }];
}

#pragma mark - Private
- (void)applyOrientation {
    UIInterfaceOrientation orientation = [[UIApplication sharedApplication] statusBarOrientation];
    float scanRectRotation;
    float captureRotation;
    
    switch (orientation) {
        case UIInterfaceOrientationPortrait:
            captureRotation = 0;
            scanRectRotation = 90;
            break;
        case UIInterfaceOrientationLandscapeLeft:
            captureRotation = 90;
            scanRectRotation = 180;
            break;
        case UIInterfaceOrientationLandscapeRight:
            captureRotation = 270;
            scanRectRotation = 0;
            break;
        case UIInterfaceOrientationPortraitUpsideDown:
            captureRotation = 180;
            scanRectRotation = 270;
            break;
        default:
            captureRotation = 0;
            scanRectRotation = 90;
            break;
    }
    [self applyRectOfInterest:orientation];
    CGAffineTransform transform = CGAffineTransformMakeRotation((CGFloat) (captureRotation / 180 * M_PI));
    [self.capture setTransform:transform];
    [self.capture setRotation:scanRectRotation];
    self.capture.layer.frame = self.view.frame;
}

- (void)applyRectOfInterest:(UIInterfaceOrientation)orientation {
    CGFloat scaleVideo, scaleVideoX, scaleVideoY;
    CGFloat videoSizeX, videoSizeY;
    CGRect transformedVideoRect = self.view.frame;
    if([self.capture.sessionPreset isEqualToString:AVCaptureSessionPreset1920x1080]) {
        videoSizeX = 1080;
        videoSizeY = 1920;
    } else {
        videoSizeX = 720;
        videoSizeY = 1280;
    }
    if(UIInterfaceOrientationIsPortrait(orientation)) {
        scaleVideoX = self.view.frame.size.width / videoSizeX;
        scaleVideoY = self.view.frame.size.height / videoSizeY;
        scaleVideo = MAX(scaleVideoX, scaleVideoY);
        if(scaleVideoX > scaleVideoY) {
            transformedVideoRect.origin.y += (scaleVideo * videoSizeY - self.view.frame.size.height) / 2;
        } else {
            transformedVideoRect.origin.x += (scaleVideo * videoSizeX - self.view.frame.size.width) / 2;
        }
    } else {
        scaleVideoX = self.view.frame.size.width / videoSizeY;
        scaleVideoY = self.view.frame.size.height / videoSizeX;
        scaleVideo = MAX(scaleVideoX, scaleVideoY);
        if(scaleVideoX > scaleVideoY) {
            transformedVideoRect.origin.y += (scaleVideo * videoSizeX - self.view.frame.size.height) / 2;
        } else {
            transformedVideoRect.origin.x += (scaleVideo * videoSizeY - self.view.frame.size.width) / 2;
        }
    }
    _captureSizeTransform = CGAffineTransformMakeScale(1/scaleVideo, 1/scaleVideo);
    self.capture.scanRect = CGRectApplyAffineTransform(transformedVideoRect, _captureSizeTransform);
}

#pragma mark - Private Methods

- (NSString *)barcodeFormatToString:(ZXBarcodeFormat)format {
    switch (format) {
        case kBarcodeFormatAztec:
            return @"Aztec";
            
        case kBarcodeFormatCodabar:
            return @"CODABAR";
            
        case kBarcodeFormatCode39:
            return @"Code 39";
            
        case kBarcodeFormatCode93:
            return @"Code 93";
            
        case kBarcodeFormatCode128:
            return @"Code 128";
            
        case kBarcodeFormatDataMatrix:
            return @"Data Matrix";
            
        case kBarcodeFormatEan8:
            return @"EAN-8";
            
        case kBarcodeFormatEan13:
            return @"EAN-13";
            
        case kBarcodeFormatITF:
            return @"ITF";
            
        case kBarcodeFormatPDF417:
            return @"PDF417";
            
        case kBarcodeFormatQRCode:
            return @"QR Code";
            
        case kBarcodeFormatRSS14:
            return @"RSS 14";
            
        case kBarcodeFormatRSSExpanded:
            return @"RSS Expanded";
            
        case kBarcodeFormatUPCA:
            return @"UPCA";
            
        case kBarcodeFormatUPCE:
            return @"UPCE";
            
        case kBarcodeFormatUPCEANExtension:
            return @"UPC/EAN extension";
            
        default:
            return @"Unknown";
    }
}

- (void)viewWillLayoutSubviews
{
    [super viewWillLayoutSubviews];
    
}


- (void)scanAnimate
{
    /*******************/
    _imgLine.frame = CGRectMake(0, self.startY, mainWidth, 12);
    [UIView animateWithDuration:2 animations:^{
        _imgLine.frame = CGRectMake(0, self.endY, mainWidth, 12);
    }];
}

- (void)loadView:(CGRect)rect
{
    /*******************/
    
    _imgLine.frame = CGRectMake(0, self.startY, mainWidth, 12);
    [self scanAnimate];
}


#pragma mark - Managing the Block

- (void)setCompletionWithBlock:(void (^) (NSString *resultAsString))completionBlock
{
    self.completionBlock = completionBlock;
}

#pragma mark - Initializing the AV Components

- (void)setupUIComponentsWithCancelButtonTitle:(NSString *)cancelButtonTitle
{
    
    self.capture = [[ZXCapture alloc] init];
    self.capture.camera = self.capture.back;
    self.capture.focusMode = AVCaptureFocusModeContinuousAutoFocus;
    self.capture.layer.frame = self.view.frame;
    //    self.capture.delegate = self;
    [self.view.layer addSublayer:self.capture.layer];
    
    self.cancelButton                                       = [[UIButton alloc] init];
    self.cancelButton.hidden                                = YES;
    _cancelButton.translatesAutoresizingMaskIntoConstraints = NO;
    [_cancelButton setTitle:cancelButtonTitle forState:UIControlStateNormal];
    [_cancelButton setTitleColor:[UIColor grayColor] forState:UIControlStateHighlighted];
    [_cancelButton addTarget:self action:@selector(cancelAction:) forControlEvents:UIControlEventTouchUpInside];
    _cancelButton.frame = CGRectMake((PP_SCREEN_WIDTH-80)/2, PP_SCREEN_HEIGHT - 100, 80, 40);
    [self.view addSubview:_cancelButton];
    
    
    
    CGFloat c_width = mainWidth - 100;
    CGFloat s_height = mainHeight - 40;
    CGFloat y = (s_height - c_width) / 2 - s_height / 6;
    
    _lblTip = [[UILabel alloc] initWithFrame:CGRectMake(0,y + 90 + c_width, mainWidth, 15)];
    _lblTip.text = @"将二维码，条形码放入框内 即可自动扫描";
    _lblTip.textColor = [UIColor whiteColor];
    _lblTip.font = [UIFont systemFontOfSize:13];
    _lblTip.textAlignment = NSTextAlignmentCenter;
    [self.view addSubview:_lblTip];
    
    CGFloat corWidth = 16;
    
    UIImageView* img1 = [[UIImageView alloc] initWithFrame:CGRectMake(49, y + 76, corWidth, corWidth)];
    img1.image = [UIImage imageNamed:@"cor1"];
    [self.view addSubview:img1];
    self.startY = y+76;
    
    UIImageView* img2 = [[UIImageView alloc] initWithFrame:CGRectMake(35 + c_width, y + 76, corWidth, corWidth)];
    img2.image = [UIImage imageNamed:@"cor2"];
    [self.view addSubview:img2];
    
    UIImageView* img3 = [[UIImageView alloc] initWithFrame:CGRectMake(49, y + c_width + 64, corWidth, corWidth)];
    img3.image = [UIImage imageNamed:@"cor3"];
    [self.view addSubview:img3];
    
    UIImageView* img4 = [[UIImageView alloc] initWithFrame:CGRectMake(35 + c_width, y + c_width + 64, corWidth, corWidth)];
    img4.image = [UIImage imageNamed:@"cor4"];
    [self.view addSubview:img4];
    self.endY = y + c_width + 64;
    
    _imgLine = [[UIImageView alloc] init];
    _imgLine.image = [UIImage imageNamed:@"QRCodeScanLine"];
    [self.view addSubview:_imgLine];
}



#pragma mark - Catching Button Events

- (void)cancelAction:(UIButton *)button
{
    [self stopScanning];
    
    if (_completionBlock) {
        _completionBlock(nil);
    }
    
    if (_delegate && [_delegate respondsToSelector:@selector(readerDidCancel:)]) {
        [_delegate readerDidCancel:self];
    }
}


#pragma mark - Controlling Reader

- (void)startScanning;
{
    if(_timerScan)
    {
        [_timerScan invalidate];
        _timerScan = nil;
    }
    
    _timerScan = [NSTimer scheduledTimerWithTimeInterval:2 target:self selector:@selector(scanAnimate) userInfo:nil repeats:YES];
}

- (void)stopScanning;
{
    
    if(_timerScan)
    {
        [_timerScan invalidate];
        _timerScan = nil;
    }
}


#pragma mark - Checking the Metadata Items Types

+ (BOOL)isAvailable
{
    @autoreleasepool {
        AVCaptureDevice *captureDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
        
        if (!captureDevice) {
            return NO;
        }
        
        NSError *error;
        AVCaptureDeviceInput *deviceInput = [AVCaptureDeviceInput deviceInputWithDevice:captureDevice error:&error];
        
        if (!deviceInput || error) {
            return NO;
        }
        
        AVCaptureMetadataOutput *output = [[AVCaptureMetadataOutput alloc] init];
        
        if (![output.availableMetadataObjectTypes containsObject:AVMetadataObjectTypeQRCode]) {
            return NO;
        }
        
        return YES;
    }
}

#pragma mark - Checking RightBarButtonItem
-(void)clickRightBarButton:(UIBarButtonItem*)item
{
    self.detector = [CIDetector detectorOfType:CIDetectorTypeQRCode context:nil options:@{ CIDetectorAccuracy : CIDetectorAccuracyHigh }];
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    picker.delegate = self;
    picker.allowsEditing = NO;
    picker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    [self.navigationController presentViewController:picker animated:YES completion:nil];
}

#pragma mark - UIImagePickerControllerDelegate
- ( void )imagePickerController:( UIImagePickerController *)picker didFinishPickingMediaWithInfo:( NSDictionary *)info
{
    [picker dismissViewControllerAnimated:YES completion:nil];
    UIImage *image = [info objectForKey:UIImagePickerControllerEditedImage];
    if (!image){
        image = [info objectForKey:UIImagePickerControllerOriginalImage];
    }
    
    //    NSArray *features = [self.detector featuresInImage:[CIImage imageWithCGImage:image.CGImage]
    //                                               options:@{CIDetectorImageOrientation:[NSNumber numberWithInt:1]}];
    NSArray *features = [self.detector featuresInImage:[CIImage imageWithCGImage:image.CGImage]];
    if (features.count >=1) {
      
        CIQRCodeFeature *feature = [features objectAtIndex:0];
        NSString *scannedResult = feature.messageString;
        if (_completionBlock) {
            [_beepPlayer play];
            _completionBlock(scannedResult);
        }
        
        if (_delegate && [_delegate respondsToSelector:@selector(reader:didScanResult:)]) {
            [_delegate reader:self didScanResult:scannedResult];
        }
    }
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    [self dismissViewControllerAnimated:YES completion:nil];
}

#pragma mark - ZXCaptureDelegate Methods

- (void)captureResult:(ZXCapture *)capture result:(ZXResult *)result {
    if (!result) return;
    
    NSString *scannedResult = [NSString stringWithFormat:@"%@",result.text];
    
    if (self.isOver) {
        return;
        
    }
    self.isOver = YES;
    AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
    
    
    [self.capture stop];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 2 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [self.capture start];
        self.isOver = NO;

    });
//    [self stopScanning];
  
    if (_completionBlock) {
        [_beepPlayer play];
        _completionBlock(scannedResult);
    }
    
    if (_delegate && [_delegate respondsToSelector:@selector(reader:didScanResult:)]) {
        [_delegate reader:self didScanResult:scannedResult];
    }
}


@end
