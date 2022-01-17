/**
 * 药品分类数据模型
 */
export default class YFWWDCategoryItemModel { 
    constructor(name,id) { 
        this.name = name
        this.id = id
    }

    /**
     * 
     * @param {对象实例} data 
     */
    static init(data) { 
        let instance = new YFWWDCategoryItemModel()
        instance.id = data.id
        instance.name = data.name
        return instance
    }
}