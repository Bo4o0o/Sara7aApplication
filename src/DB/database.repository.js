export const findOne = async ({model, filter={}, select = "" , options = {}}) => {
        const doc =  model.findOne(filter, select, options);
        if(select?.length) doc.select(select);
        if(options?.populate) doc.populate(options.populate);
        if(options?.lean) doc.lean();
        return await doc.exec();
    };

export const findById = async ({model, id, select = "", options = {}}) => {
        const doc =  model.findById(id);
        if(select?.length) doc.select(select);
        if(options?.populate) doc.populate(options.populate);
        if(options?.lean) doc.lean();
        return await doc.exec();
    };

export const find = async ({model, filter={}, select = "", options = {}}) => {
        const docs =  model.find(filter);
        if(select?.length) docs.select(select);
        if(options?.sort) docs.sort(options.sort);
        if(options?.limit) docs.limit(options.limit);
        if(options?.skip) docs.skip(options.skip);
        if(options?.lean) docs.lean();
        return await docs.exec();
    }

export const create = async ({model, data=[] , options = {validateBeforeSave: true}}) => {
    const [doc] = (await model.create(data, options)) || [];
    return doc;
};

export const insertMany = async ({model, data=[] }) => {
    return await model.insertMany(data, options);
}

export const updateOne = async ({model, filter={}, update, options }) => {
    return await model.updateOne(filter, {...update, $inc: {__v: 1}}, options);
};

export const findOneAndUpdate = async ({model, filter = {} , update  , options }) => {
    return await model.findOneAndUpdate(
        filter, 
        {...update, $inc: {__v: 1}},
     {...options , returnDocument: "after" , runValidators: true}
    );
};

export const findByIdAndUpdate = async ({model, id, update, options}) => {
    return await model.findByIdAndUpdate(
        id,
        {...update, $inc: {__v: 1}},
     {...options , returnDocument: "after" , runValidators: true}
    );
};

export const findOneAndDelete = async ({model, filter = {}}) => {
    return await model.findOneAndDelete(filter);
};

export const deleteOne = async ({model, filter = {}}) => {
    return await model.deleteOne(filter, options);
};

export const deleteMany = async ({model, filter = {}}) => {
    return await model.deleteMany(filter, options);
};



