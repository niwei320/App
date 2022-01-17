import React from 'react';
import { TextInput, TouchableOpacity, Text, Image, View, FlatList, StyleSheet } from 'react-native';
import { adaptSize, kScreenWidth, getStatusBarHeight, isEmpty, saf } from '../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import ResultsPage from '../O2OSearch/components/ResultsPage'
export default class YFWO2OCategoryResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        let { viewModel } = this.props;
        let { dataSource, resultHeaderItem, navigationBar } = viewModel;
        return (
            <View style={[BaseStyles.container]}>
                <View style={[BaseStyles.leftCenterView,{ width: kScreenWidth, paddingTop: adaptSize(getStatusBarHeight() + 24), justifyContent: 'space-between',backgroundColor:'#ffffff',paddingBottom:adaptSize(10) }]}
                >
                    <TouchableOpacity style={{width: adaptSize(17),marginLeft: adaptSize(12) }} activeOpacity={0.3} hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={() => { viewModel.goBack() }}><Image style={{ width: adaptSize(7), height: adaptSize(14), tintColor: 'black',}} source={navigationBar.backIcon} />
                    </TouchableOpacity>
                    <Text style={{fontSize:16,color:'#333333',fontWeight:'bold'}}>
                        {navigationBar.categoryName}
                    </Text>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{marginRight:adaptSize(15) }}
                        onPress={() => { viewModel._dealNavigation({type:'O2O_Search'}) }}>
                        <Image style={{ width: adaptSize(14), height: adaptSize(15) ,tintColor:'#666666'}} source={navigationBar.searchIcon} />
                    </TouchableOpacity>
                </View>
                <ResultsPage keywords={viewModel.categoryId} categoryId={viewModel.categoryId} dataSource={dataSource} resultHeaderItem={resultHeaderItem} onRefresh={viewModel.onRefresh} refreshing={viewModel.refreshing} noMore={viewModel.noMore} index={viewModel.index} _dealNavigation={(data)=>viewModel._dealNavigation(data)} firstLoad={viewModel.firstLoad}/>
            </View>
        );
    }
}
const styles = StyleSheet.create({

});
