'use strict';

import React, {
    Component,
} from 'react';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    ListView,
    TouchableWithoutFeedback,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableHighlight,
    Modal,
    ActivityIndicator,
    FlatList,
    Image, Platform, NativeModules
} from 'react-native';

import PropTypes from 'prop-types';
import {isNotEmpty, kScreenHeight, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {darkLightColor} from "../Utils/YFWColor";
import YFWNativeManager from "../Utils/YFWNativeManager";
import * as StatusBarManager from "react-native";
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const TOUCHABLE_ELEMENTS = [
    'TouchableHighlight',
    'TouchableOpacity',
    'TouchableWithoutFeedback',
    'TouchableNativeFeedback'
];

export default class ModalDropdown extends Component {
    static propTypes = {
        disabled: PropTypes.bool,
        scrollEnabled: PropTypes.bool,
        defaultIndex: PropTypes.number,
        defaultValue: PropTypes.string,
        options: PropTypes.array,

        accessible: PropTypes.bool,
        animated: PropTypes.bool,
        showsVerticalScrollIndicator: PropTypes.bool,
        keyboardShouldPersistTaps: PropTypes.string,

        style: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
        textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
        dropdownStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
        dropdownTextStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
        dropdownTextHighlightStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),

        adjustFrame: PropTypes.func,
        renderRow: PropTypes.func,
        renderSeparator: PropTypes.func,
        renderButtonText: PropTypes.func,

        onDropdownWillShow: PropTypes.func,
        onDropdownWillHide: PropTypes.func,
        onSelect: PropTypes.func
    };

    static defaultProps = {
        disabled: false,
        scrollEnabled: true,
        defaultIndex: -1,
        defaultValue: 'Please select...',
        options: null,
        animated: true,
        showsVerticalScrollIndicator: true,
        keyboardShouldPersistTaps: 'never'
    };

    constructor(props) {
        super(props);

        this._button = null;
        this._buttonFrame = null;
        this._nextValue = null;
        this._nextIndex = null;
        this.top_height = null;
        this.state = {
            accessible: !!props.accessible,
            loading: !props.options,
            showDropdown: false,
            buttonText: props.defaultValue,
            selectedIndex: props.defaultIndex,
            selectArrow:this.props.selectArrow,
            unSelectArrow:this.props.unSelectArrow
        };
    }

    componentWillReceiveProps(nextProps) {
        let {buttonText, selectedIndex} = this.state;
        const {defaultIndex, defaultValue, options} = nextProps;
        buttonText = this._nextValue == null ? buttonText : this._nextValue;
        selectedIndex = this._nextIndex == null ? selectedIndex : this._nextIndex;
        if (selectedIndex < 0) {
            selectedIndex = defaultIndex;
            if (selectedIndex < 0) {
                buttonText = defaultValue;
            }
        }
        this._nextValue = null;
        this._nextIndex = null;

        this.setState({
            loading: !options,
            buttonText,
            selectedIndex
        });
    }

    render() {
        let bgcolor = 'white'
        return (
            <View {...this.props} style={{backgroundColor:bgcolor}}>
                {this._renderButton()}
                {this._renderModal()}
            </View>
        );
    }

    _updatePosition(callback) {
        if (this._button && this._button.measure) {
            this._button.measure((fx, fy, width, height, px, py) => {
                this._buttonFrame = {x: px, y: py, w: width, h: height};
                callback && callback();
            });
        }
    }

    show() {
        this._updatePosition(() => {
            this.modalView && this.modalView.show()
            this.setState({
                showDropdown: true
            });
        });
    }

    hide() {
        this.modalView && this.modalView.disMiss()
        this.setState({
            showDropdown: false
        });
    }

    select(idx) {
        const {defaultValue, options, defaultIndex, renderButtonText} = this.props;

        let value = defaultValue;
        if (idx == null || !options || idx >= options.length) {
            idx = defaultIndex;
        }

        if (idx >= 0) {
            value = renderButtonText ? renderButtonText(options[idx]) : options[idx].toString();
        }

        this._nextValue = value;
        this._nextIndex = idx;

        this.setState({
            buttonText: value,
            selectedIndex: idx
        });
    }

    _renderButton() {
        const {disabled, accessible, children, textStyle} = this.props;
        const {buttonText} = this.state;

        return (
            <TouchableOpacity ref={button => this._button = button}
                              disabled={disabled}
                              accessible={accessible}
                              onPress={this._onButtonPress}

            >
                {
                    children ||
                    (
                        <View style={[styles.button,{marginLeft:23,height:49,alignItems:'center',flexDirection:'row',justifyContent:'center'}]}>
                            <Text style={[styles.buttonText, textStyle,{marginRight:3}]} numberOfLines={1}>{buttonText}</Text>
                            {this.renderArrow()}
                        </View>
                    )
                }
            </TouchableOpacity>
        );
    }

    renderArrow(){
        if(this.state.showDropdown && this.state.selectArrow){
            return <Image source={this.state.selectArrow} style={{width:5,height:5,resizeMode:'contain'}}/>
        }else if(this.state.unSelectArrow){
            return <Image source={this.state.unSelectArrow} style={{width:5,height:5,resizeMode:'contain',transform:[{rotate:'180deg'}]}}/>
        }
    }

    _onButtonPress = () => {
        const {onDropdownWillShow} = this.props;
        if (!onDropdownWillShow ||
            onDropdownWillShow() !== false) {
            this.show();
        }
        YFWNativeManager.mobClick('price page-default')
    };

    _renderModal() {
        const {animated, accessible, dropdownStyle} = this.props;
        const {showDropdown, loading} = this.state;

        this.top_height = this._buttonFrame&&this._buttonFrame.y+this._buttonFrame.h/2-49/2;
        let marginTop = 0
        if(Platform.OS == 'android'){
            marginTop = Platform.Version > 19 ? NativeModules.StatusBarManager.HEIGHT : 0
        }
        if (showDropdown && this._buttonFrame) {
            const frameStyle = this._calcPosition();
            const animationType = animated ? 'fade' : 'none';
            return (
                <Modal animationType={animationType}
                       visible={true}
                       transparent={true}
                       onRequestClose={this._onRequestClose}
                       supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                       // ref={(c) => this.modalView = c}
                >
                    <TouchableWithoutFeedback accessible={accessible} disabled={!showDropdown} onPress={this._onModalPress}>
                        <View style={[styles.modal,{marginTop:-marginTop}]}>
                            <View style={[styles.dropdown, frameStyle,dropdownStyle,{backgroundColor:'rgba(0,0,0,0.5)'}]}>
                                {loading ? this._renderLoading() : this._renderDropdown()}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            );
        }
    }

    _calcPosition() {
        const {dropdownStyle, style, adjustFrame} = this.props;

        const dimensions = Dimensions.get('window');
        const windowWidth = dimensions.width;
        const windowHeight = dimensions.height;

        const dropdownHeight = (dropdownStyle && StyleSheet.flatten(dropdownStyle).height) ||
            StyleSheet.flatten(styles.dropdown).height;

        const bottomSpace = windowHeight - this._buttonFrame.y - this._buttonFrame.h;
        const rightSpace = windowWidth - this._buttonFrame.x;
        const showInBottom = bottomSpace >= dropdownHeight || bottomSpace >= this._buttonFrame.y;
        const showInLeft = rightSpace >= this._buttonFrame.x;

        const positionStyle = {
            height: dropdownHeight,
            top: true ? this._buttonFrame.y + this._buttonFrame.h : Math.max(0, this._buttonFrame.y - dropdownHeight),
        };

        if (showInLeft) {
            positionStyle.left = this._buttonFrame.x;
        } else {
            const dropdownWidth = (dropdownStyle && StyleSheet.flatten(dropdownStyle).width) ||
                (style && StyleSheet.flatten(style).width) || -1;
            if (dropdownWidth !== -1) {
                positionStyle.width = dropdownWidth;
            }
            positionStyle.right = rightSpace - this._buttonFrame.w;
        }

        return adjustFrame ? adjustFrame(positionStyle) : positionStyle;
    }

    _onRequestClose = () => {
        const {onDropdownWillHide} = this.props;
        if (!onDropdownWillHide ||
            onDropdownWillHide() !== false) {
            this.hide();
        }
    };

    _onModalPress = () => {
        const {onDropdownWillHide} = this.props;
        if (!onDropdownWillHide ||
            onDropdownWillHide() !== false) {
            this.hide();
        }
    };

    _renderLoading() {
        return (
            <ActivityIndicator size='small'/>
        );
    }

    _renderDropdown() {
        return (
            <FlatList scrollEnabled={true}
                      data={this.props.options}
                      renderItem={this._renderItem}
                      ItemSeparatorComponent={this._renderSeparator}
                      automaticallyAdjustContentInsets={false}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps={true}
                      style={{height:height,width:width}}
            />
        );
    }

    get _dataSource() {
        const {options} = this.props;
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        return ds.cloneWithRows(options);
    }

    _renderItem=(item)=>{
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{this._click(item.item,item.index)}} style={{paddingTop:14,paddingBottom:17,backgroundColor:'white',justifyContent:'center'}}>
                <Text style={[
                    styles.rowText,
                ]}>
                    {item.item}
                </Text>
            </TouchableOpacity>
        )
    }

    _click(item,index){
        const {onSelect,onDropdownWillHide} = this.props;
        if(isNotEmpty(onSelect)){
            onSelect(index, item)
        }
        if (!onDropdownWillHide || onDropdownWillHide() !== false) {
            this.setState({
                showDropdown: false
            });
        }
    }

    _renderRow = (rowData, sectionID, rowID, highlightRow) => {
        const {renderRow, dropdownTextStyle, dropdownTextHighlightStyle, accessible} = this.props;
        const {selectedIndex} = this.state;
        const key = `row_${rowID}`;
        const highlighted = rowID == selectedIndex;
        const row = !renderRow ?
            (
                <View style={{paddingTop:10,paddingBottom:10,backgroundColor:'white',justifyContent:'center'}}>
                    <Text style={[
                        styles.rowText,
                        dropdownTextStyle,
                        highlighted && styles.highlightedRowText,
                        highlighted && dropdownTextHighlightStyle
                    ]}>
                        {rowData}
                    </Text>
                </View>
                ) :
            renderRow(rowData, rowID, highlighted);
        const preservedProps = {
            key,
            accessible,
            onPress: () => this._onRowPress(rowData, sectionID, rowID, highlightRow),
        };
        if (TOUCHABLE_ELEMENTS.find(name => name == row.type.displayName)) {
            const props = {...row.props};
            props.key = preservedProps.key;
            props.onPress = preservedProps.onPress;
            const {children} = row.props;
            switch (row.type.displayName) {
                case 'TouchableHighlight': {
                    return (
                        <TouchableHighlight {...props}>
                            {children}
                        </TouchableHighlight>
                    );
                }
                case 'TouchableOpacity': {
                    return (
                        <TouchableOpacity {...props}>
                            {children}
                        </TouchableOpacity>
                    );
                }
                case 'TouchableWithoutFeedback': {
                    return (
                        <TouchableWithoutFeedback {...props}>
                            {children}
                        </TouchableWithoutFeedback>
                    );
                }
                case 'TouchableNativeFeedback': {
                    return (
                        <TouchableNativeFeedback {...props}>
                            {children}
                        </TouchableNativeFeedback>
                    );
                }
                default:
                    break;
            }
        }
        return (
            <TouchableHighlight {...preservedProps}>
                {row}
            </TouchableHighlight>
        );
    };

    _onRowPress(rowData, sectionID, rowID, highlightRow) {
        const {onSelect, renderButtonText, onDropdownWillHide} = this.props;
        if (!onSelect || onSelect(rowID, rowData) !== false) {
            highlightRow(sectionID, rowID);
            const value = renderButtonText && renderButtonText(rowData) || rowData.toString();
            this._nextValue = value;
            this._nextIndex = rowID;
            this.setState({
                buttonText: value,
                selectedIndex: rowID
            });
        }
        if (!onDropdownWillHide || onDropdownWillHide() !== false) {
            this.setState({
                showDropdown: false
            });
        }
    }

    _renderSeparator = (sectionID, rowID, adjacentRowHighlighted) => {
        const key = `spr_${rowID}`;
        return (
            <View style={{backgroundColor:'white',width:width,height:1}}>
                <View style={styles.separator}
                  key={key}
            />
            </View>
        );
    };
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 13,
        color: '#666666',
    },
    modal: {
        flexGrow: 1
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    loading: {
        alignSelf: 'center'
    },
    list: {
        //flexGrow: 1,
    },
    rowText: {
        paddingLeft: 25,
        fontSize: 15,
        color: '#333',
        fontWeight:'500',
        backgroundColor: 'white',
        textAlignVertical: 'center'
    },
    highlightedRowText: {
        color: '#666666'
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(204,204,204,0.4)',
        marginLeft:20,
        flex:1
    }
});
