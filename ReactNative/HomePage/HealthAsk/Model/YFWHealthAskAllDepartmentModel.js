import React from 'react'
import {isNotEmpty, safe, strMapToObj} from "../../../PublicModule/Util/YFWPublicFunction";
export default class YFWHealthAskAllDepartmentModel extends React.Component {

    constructor(props) {
        super(props);

        this.item = [];
    }

    setModelData(data) {
        if (isNotEmpty(data)) {
                let items = [];
                if (isNotEmpty(data)) {
                    data.forEach((item,index)=>{
                        let subItems = [];
                        let parent_py = item.py_name
                        if (isNotEmpty(item.items)) {
                            item.items.forEach((item,index)=>{
                                subItems.push({
                                    py_name:item.py_name,
                                    parent_py:parent_py,
                                    dep_name:item.department_name,
                                    dep_id:item.id,
                                });
                            });
                        }
                        items.push({
                            py_name:item.py_name,
                            dep_id:item.id,
                            dep_name:item.department_name,
                            item:subItems,
                            });
                    });
                }
                this.item = items;
                return this;
        }
    }

    static getModelArray(array) {
        let model = new YFWHealthAskAllDepartmentModel();
        let ModeData =  model.setModelData(array);
        return ModeData;

    }
}