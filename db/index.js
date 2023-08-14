let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
// DB functions
const findItems = async (model, query) => {
  if (query == null) {
    return false;
  } else {
    const foundExist = await model.find(query)
    return foundExist;
  }
}

const createAndSave = async (model, data, query=null, done) => {
  let exist = await findItems(model, query);
  if (exist?.length <= 1) {
    exist = exist[0]
  }
  let newRecord = new model(data);

  if (exist) {
    done(null, exist);
  } else {
    const response = await newRecord.save()
    done(null, response);
  }
}

// database Configuration
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true }, // String is shorthand for {type: String}
});

const exerciseSchema = new Schema({
  _userId:{type: Schema.Types.ObjectId, required:true},
  description: { type: String, required: true }, // String is shorthand for {type: String}
  duration: { type: Number, required: true },
  date: { type: Date }
});

const userModel = mongoose.model('user', userSchema, 'user');
const exerciseModel = mongoose.model('exercise', exerciseSchema);



// const Models = {
//   userModel: {
//     model:userModel,

//   }
// }

// Exporting models
exports.userModel = userModel;
exports.exerciseModel = exerciseModel;
exports.createAndSave = createAndSave;
exports.findItems = findItems;