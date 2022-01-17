import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDFeedbackModel from '../Model/YFWWDFeedbackModel';
import YFWWDFeedbackView from '../View/YFWWDFeedbackView';
import YFWToast from '../../../Utils/YFWToast';
import { EMOJIS } from '../../../PublicModule/Util/RuleString';

export default class YFWWDFeedbackController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDFeedbackModel()
        this.view = <YFWWDFeedbackView ref={(view) => this.view = view} father={this} model={this.model}/>
    }

    render() {
        return this.view
    }

    /******************delegete********************/
    backMethod() { 
        super.backMethod()
    }

    onTextChange(text) { 
        this.model.content = text.replace(EMOJIS,'')
        this.view.updateViews&&this.view.updateViews()
    }

    upload() { 
        if (this.model.content.length == 0) {
            YFWToast('请填写内容！')
            return
        }
        if(isEmoji(this.model.content)){
            YFWToast('内容无法包含表情符号')
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.feedback')
        paramMap.set('content', this.model.content)
        this.model.requestWithParams(paramMap, () => { 
            YFWToast('提交成功！')
            this.props.navigation.goBack()
        }, (error) => { 
            YFWToast(error+'')
        })
    }
}