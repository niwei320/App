import React from 'react';
import { TextInput, TouchableOpacity, Text, Image, View, FlatList, StyleSheet } from 'react-native';
import { adaptSize, kScreenWidth, getStatusBarHeight, isEmpty, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import HistoryAndHotWords from './components/HistoryAndHotWords'
import SearchTextRelative from './components/SearchTextRelative'
import ResultsPage from './components/ResultsPage'
export default class YFWO2OSearchView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    _renderDeletIcon(searchText, searchDeleteIcon, _removeKeywords) {
        if (isNotEmpty(searchText) && searchText.length > 0) {
            return (
                <TouchableOpacity activeOpacity={1} onPress={() => _removeKeywords()} hitSlop={{ left: adaptSize(10), top: adaptSize(10), bottom: adaptSize(10), right: 0 }}>
                    <Image style={{ width: adaptSize(16), height: adaptSize(16), resizeMode: 'contain', marginRight: adaptSize(5), opacity: 0.4 }} source={searchDeleteIcon} />
                </TouchableOpacity>
            )
        }
    }
    render() {
        let { viewModel } = this.props;
        let { searchInput, historySearch, hotSearch, showType, relative, clickMethod, dataSource, resultHeaderItem, relativeItems,hotWords} = viewModel;
        return (
            <View style={[BaseStyles.container, { backgroundColor: showType !== 3 ? '#ffffff' : '#fafafa', }]}>
                <View style={{ width: kScreenWidth, marginTop: adaptSize(getStatusBarHeight() + 24) }}
                >
                    <View style={[BaseStyles.leftCenterView, { height: adaptSize(33), marginLeft: adaptSize(12) }]}>
                        {showType === 3 && <TouchableOpacity activeOpacity={1} onPress={() => { viewModel.goBack() }}><Image style={{ width: adaptSize(7), height: adaptSize(14), tintColor: 'black', marginRight: adaptSize(14) }} source={searchInput.backIcon} /></TouchableOpacity>}
                        <View style={{ width: showType !== 3 ? adaptSize(310) : kScreenWidth - adaptSize(46), height: adaptSize(33), borderRadius: adaptSize(17), backgroundColor: showType === 3 ? '#ffffff' : '#f5f5f5', alignItems: 'center', flexDirection: 'row', resizeMode: 'stretch' }}>
                            <Image style={{ width: adaptSize(15), height: adaptSize(15), marginLeft: adaptSize(9), marginTop: adaptSize(9), marginBottom: adaptSize(9) }}
                                source={searchInput.searchIcon} />
                            <TextInput
                                placeholder={searchInput.placeholder}
                                placeholderTextColor="#cccccc"
                                onChangeText={(text) => { viewModel.onChangeText(text) }}
                                onSubmitEditing={(event) => { viewModel.searchClick(event.nativeEvent.text) }}
                                value={searchInput.searchText}
                                returnKeyType={'search'}
                                autoFocus={isEmpty(searchInput.searchText) && showType !== 3}
                                onFocus={() => { viewModel.onFocus() }}
                                selectionColor={'#5799f7'}
                                underlineColorAndroid='transparent'
                                style={{ padding: 0, flex: 1, marginLeft: adaptSize(5), marginRight: adaptSize(5), fontSize: 14 }}
                            >
                                {/* {this._textInputText()} */}
                            </TextInput>
                            {showType !== 3 && this._renderDeletIcon(searchInput.searchText, searchInput.searchDeleteIcon, viewModel._removeKeywords)}
                        </View>
                        {showType !== 3 && <TouchableOpacity
                            style={{ marginLeft: adaptSize(14) }}
                            hitSlop={{ left: adaptSize(10), top: adaptSize(10), bottom: adaptSize(10), right: 0 }}
                            onPress={() => { viewModel.goBack() }}>
                            <Text style={{ fontSize: 14, color: '#5799f7' }}>{searchInput.cancelText}</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
                {showType === 1 && <HistoryAndHotWords historySearch={historySearch} hotSearch={hotSearch} clickMethod={clickMethod} hotWords={hotWords}/>}
                {showType === 2 && <SearchTextRelative searchText={searchInput.searchText} relative={relative} clickMethod={clickMethod} relativeItems={relativeItems} />}
                {showType === 3 && <ResultsPage keywords={searchInput.searchText} dataSource={dataSource} resultHeaderItem={resultHeaderItem} onRefresh={viewModel.onRefresh} refreshing={viewModel.refreshing} noMore={viewModel.noMore} index={viewModel.index}  _dealNavigation={(data)=>viewModel._dealNavigation(data)} firstLoad={viewModel.firstLoad}/>}
            </View>
        );
    }
}
const styles = StyleSheet.create({

});
