const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
}, { strict: false, timestamps: true });

const Setting = mongoose.model('SettingTestSet', SettingSchema);

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/test-set');
  await Setting.deleteMany({});
  
  const s = new Setting({ _id: 'global' });
  await s.save();
  
  let setting = await Setting.findById('global');
  setting.set({ orderProcessingMode: 'immediate' });
  setting.markModified('orderProcessingMode');
  await setting.save();
  
  let updated = await Setting.findById('global');
  console.log("Updated setting:", updated.toObject());
  process.exit(0);
})();
