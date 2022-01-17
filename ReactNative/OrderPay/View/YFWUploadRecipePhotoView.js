import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,

} from 'react-native'
import {yfwOrangeColor,yfwGreenColor} from '../../Utils/YFWColor'
import {isNotEmpty, safe} from "../../PublicModule/Util/YFWPublicFunction";
import YFWImagePicker from "../../Utils/YFWImagePicker";

export default class YFWUploadRecipePhotoView extends Component {

    constructor(props) {
        super(props);
        this.state={
            imageUri:this.props.imageUri,
        };
    }


    // ======= Action =======
    _selectPic(){
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.returnValue((result)=>{
            if (isNotEmpty(result)){
                this.props.returnImage(result);
            }
        });
        this.imagePicker.show();

    }

    // ====== View =======
    render() {
        return (
            <TouchableOpacity activeOpacity={1} onPress = {()=> this._selectPic()} style={{backgroundColor:'white',paddingHorizontal:15,paddingTop:10,paddingBottom:26}}>
                {this.renderItem()}
            </TouchableOpacity>
        )
    }


    renderItem(){

        if (isNotEmpty(this.state.imageUri)){

            return(
                <View style={{width:100,height:100}}>
                    <Image style={{width: 100, height: 100, resizeMode: "contain"}}
                       source={{uri:this.state.imageUri}}/>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.clearImage()} hitSlop={{top:10,left:10,bottom:10,right:10}} style={{position:'absolute',top:1,right:1,width:17,height:17}}>
                        <Image style={{width:17,height:17}} source={require('../../../img/photo_Close.png')}></Image>
                    </TouchableOpacity>
                </View>
            )

        } else {

            return(
                <Image style={{width: 100, height: 100, resizeMode: "cover"}}
                       source={require('../../../img/upRx_photo.png')}/>
            );

        }

    }

    clearImage(){
        this.setState({
            imageUri:null
        })
        this.props.returnImage(null)
    }


}


