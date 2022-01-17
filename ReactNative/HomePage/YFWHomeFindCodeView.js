import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity,
    Platform,
    NativeModules,DeviceEventEmitter
} from 'react-native';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import { kScreenWidth, iphoneTopMargin, safeArray, safeObj } from '../PublicModule/Util/YFWPublicFunction';
import categoryJsonData from '../data/category.json'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';

export default class YFWHomeFindCodeView extends Component {
    constructor(args) {
        super(args)
    }

    componentDidMount(){
        DeviceEventEmitter.addListener('kFindCodeClicked',(index)=>{
            let item = null
            switch (index) {
                case 0:
                    item = safeArray(categoryJsonData)[12]
                    break;
                case 1:
                    item = safeArray(categoryJsonData)[13]
                    break;
                case 2:
                    item = safeArray(categoryJsonData)[14]
                    break;
                case 3:
                    item = safeArray(categoryJsonData)[15]
                    break;
            }
            if (item) {
                this.clickedAction(item)
            }
        })
    }

    render(){


            let imageW = 40*kScreenWidth/375
            let fontSize = 12*kScreenWidth/375
            let viewW = imageW+10
            let margin = parseInt((kScreenWidth - 30 * 2 - 4 * viewW)/3)
            let views = []
            safeArray(categoryJsonData).map((item,index)=>{
                let marginL = index%4 == 0?30:margin

                let imageSource = require('../../img/category/icon_cwyy.png')
                switch (item.id) {
                    case 324:
                        imageSource = require('../../img/category/icon_gmfs.png')
                        break;
                    case 11:
                        imageSource = require('../../img/category/icon_ksyy.png')
                        break;
                    case 55:
                        imageSource = require('../../img/category/icon_xfsh.png')
                        break;
                    case 20:
                        imageSource = require('../../img/category/icon_rtyy.png')
                        break;
                    case 323:
                        imageSource = require('../../img/category/icon_jtcb.png')
                        break;
                    case 19:
                        imageSource = require('../../img/category/icon_fkyy.png')
                        break;
                    case 17:
                        imageSource = require('../../img/category/icon_pfyy.png')
                        break;
                    case 3:
                        imageSource = require('../../img/category/icon_yybj.png')
                        break;
                    case 12:
                        imageSource = require('../../img/category/icon_xxgb.png')
                        break;
                    case 10:
                        imageSource = require('../../img/category/icon_cwyy.png')
                        break;
                    case 92:
                        imageSource = require('../../img/category/icon_tnby.png')
                        break;
                    case 15:
                        imageSource = require('../../img/category/icon_fsgk.png')
                        break;
                    case 2:
                        imageSource = require('../../img/category/icon_ylqx.png')
                        break;
                    case 53:
                        imageSource = require('../../img/category/icon_grhl.png')
                        break;
                    case 6:
                        imageSource = require('../../img/category/icon_zyyp.png')
                        break;
                    case 4:
                        imageSource = require('../../img/category/icon_mrhf.png')
                        break;
                    default:
                        break;
                }

                views.push(
                    <TouchableOpacity key={item.name}  style={{marginLeft:marginL,width:viewW,marginVertical:10,alignItems:'center'}} activeOpacity={1} onPress={()=>{
                        this.clickedAction(item)
                    }} >
                        <Image style={{width:imageW,height:imageW}} source={imageSource}></Image>
                        <Text style={{color:'#666',fontSize:fontSize,textAlign:'center',marginTop:3}}>{item.name}</Text>
                    </TouchableOpacity>
                )
            })
            return (
                <View style={{backgroundColor:'white'}}>
                    <View style={{marginLeft:12,marginTop:20}}>
                        <YFWTitleView title={'快速找药'} style_title={{width:66,fontSize:15}} />
                    </View>
                    <View style={{flex:1,flexDirection:'row',flexWrap:'wrap',backgroundColor:'white',marginBottom:30}}>
                        {views}
                    </View>
                </View>

            )
    }

    clickedAction(item){
        item = safeObj(item)
        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_category',value:item.id,name:item.name});
    }
}