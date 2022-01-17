/**
 * Created by nv on 2019/5/17.
 * 主要原理是通过两层图片的叠加，底层为空星星，上层为填充后的星星，从而达到星级评分的效果。
 */
 
import React,{Component} from 'react';
import ReactNative,{
  View,Image
} from 'react-native';
import { YFWImageConst } from '../../Images/YFWImageConst';
 
export default class YFWWDStartScore extends Component {
 
  constructor(props) {
    super(props);
    this.total = this.props.total || 3; //星星的数量
    this.starSize = this.props.starSize || 20; //星星的大小
    this.starSpacing = this.props.starSpacing || 0; //星星之间的间隔
    this.starColor = this.props.starColor || 'orange'; //星星的颜色
    this.style = this.props.style
    let stars = this.props.stars || 0; //评分
    if (stars > this.total) {
      stars = this.total;
    }
    this.state = {
      stars: stars,
    }
    this.starIcon = {'red':YFWImageConst.Icon_star_selected_red,
                      'orange':YFWImageConst.Icon_star_selected_yellow
                    }
  }
 
  render() {
    return <View style={{...this.style}}>
      {this.renderEmptyStar()}
      {this.renderFullStar()}
    </View>
  }
 
  renderEmptyStar() {
    //先展现一层空的星星
    let stars = [];
    for (let i = 0; i < this.total; i++) {
      stars.push(<View key={"star-o-"+i}>
        <Image style = {{marginHorizontal: this.starSpacing,width: this.starSize * 0.93,height:this.starSize * 0.93,}}
            source={YFWImageConst.Icon_star_selected_gray} defaultSource={YFWImageConst.Icon_star_selected_gray}
        />
      </View>);
    }
    return <View style={{flexDirection:'row'}}>{stars}</View>
  }
 
  componentWillReceiveProps(nextProps) {
    if (nextProps.stars !== this.props.stars) {
      let stars = nextProps.stars || 0;
      if (stars > this.total) {
        stars = this.total;
      }
      this.setState({
        stars: stars
      });
    }
  }
 
  renderFullStar() {
    //按评分填充星星
    let stars = [];
    let width = Math.floor(this.state.stars) * (this.starSize * 0.93 + 2 * this.starSpacing)
    if (this.state.stars > Math.floor(this.state.stars)) {
      width += this.starSpacing;
      width += this.starSize * 0.93 * (this.state.stars - Math.floor(this.state.stars));
    }
    for (let i = 0; i < this.total; i++) {
      stars.push(<View key={"star-"+i}>
        <Image style = {{marginHorizontal: this.starSpacing,width: this.starSize * 0.93,height:this.starSize * 0.93,}}
            source={this.starIcon[this.starColor]} defaultSource={this.starIcon[this.starColor]}
        />
      </View>);
    }
    return <View
      style={{flexDirection:'row',position:'absolute',top:0,left:0,width:width, overflow: 'hidden'}}>{stars}</View>
  }
}