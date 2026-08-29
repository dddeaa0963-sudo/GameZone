const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
}, { strict: false, timestamps: true });

const Setting = mongoose.model('SettingTest', SettingSchema);

(async () => {
  await mongoose.connect('mongodb://localhost:27017/test-assign');
  await Setting.deleteMany({});
  
  const s = new Setting({ _id: 'global' });
  await s.save();
  
  let setting = await Setting.findById('global');
  Object.assign(setting, { orderProcessingMode: 'immediate' });
  await setting.save();
  
  let updated = await Setting.findById('global');
  console.log("Updated setting:", updated.toObject());
  process.exit(0);
})();
