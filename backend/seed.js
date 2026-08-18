const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

async function seedData() {
  try {
    console.log('Connecting to DB...');
    await connectDB();
    await sequelize.sync({ alter: true });

    console.log('Clearing existing demo data...');
    // مسح البيانات القديمة لضمان بيانات نظيفة واحترافية
    await Registration.destroy({ where: {}, truncate: false });
    await Event.destroy({ where: {}, truncate: false });
    await User.destroy({ where: {}, truncate: false });

    console.log('Creating demo users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const organizer1 = await User.create({
      name: 'د. أحمد الشافعي (منظّم الفعاليات)',
      email: 'ahmed@organizer.com',
      password: hashedPassword,
      role: 'organizer',
    });

    const organizer2 = await User.create({
      name: 'م. سارة المحمود (نادي التكنولوجيا)',
      email: 'sara@organizer.com',
      password: hashedPassword,
      role: 'organizer',
    });

    const user1 = await User.create({
      name: 'علي حسن',
      email: 'ali@user.com',
      password: hashedPassword,
      role: 'user',
    });

    const user2 = await User.create({
      name: 'مريم عبد الله',
      email: 'mariam@user.com',
      password: hashedPassword,
      role: 'user',
    });

    const user3 = await User.create({
      name: 'عمر الفاروق',
      email: 'omar@user.com',
      password: hashedPassword,
      role: 'user',
    });

    console.log('Creating demo events...');

    // 1. فعالية متاحة للتسجيل
    const event1 = await Event.create({
      title: 'مؤتمر الذكاء الاصطناعي وتطبيقات المستقبل 2026',
      description:
        'ملتقى علمي يجمع قادة الفكر والباحثين في مجالات التكنولوجيا والذكاء الاصطناعي للتعرف على أحدث التقنيات ونماذج اللغات الضخمة وبناء الحلول المبتكرة.',
      location: 'قاعة المؤتمرات الكبرى - مبنى الابتكار',
      event_date: new Date('2026-09-15T10:00:00'),
      capacity: 50,
      organizer_id: organizer1.id,
    });

    // 2. فعالية مقاعدها محدودة (2 متبقية)
    const event2 = await Event.create({
      title: 'ورشة عمل تطوير تطبيقات الويب بـ React 19 & Node.js',
      description:
        'تدريب عملي مكثف على بناء وتطوير منصات وتطبيقات الويب السريعة باستخدام أحدث تقنيات React 19 و Node.js و PostgreSQL.',
      location: 'معمل الحاسب الآلي 3 - كلية الحاسبات',
      event_date: new Date('2026-08-28T14:30:00'),
      capacity: 5,
      organizer_id: organizer1.id,
    });

    // 3. فعالية مكتملة المقاعد
    const event3 = await Event.create({
      title: 'ندوة الأمن السيبراني وحماية البيانات الشخصية',
      description:
        'جلسة حوارية متخصصة حول أفضل الممارسات والتكتيكات لحماية البيانات والأجهزة من الهجمات التشفيرية والتسريبات الرقمية.',
      location: 'مدرج الأنشطة الطلابية',
      event_date: new Date('2026-09-01T11:00:00'),
      capacity: 2,
      organizer_id: organizer2.id,
    });

    // 4. فعالية منتهية التاريخ
    const event4 = await Event.create({
      title: 'حفل استقبال الطلاب الجدد وتكريم الفائقين',
      description:
        'احتفالية الترحيب بالطلاب الجدد للعام الدراسي الجديد وتوزيع شهادات التقدير والدروع على الفائقين والأوائل.',
      location: 'المسرح الجامعي الرئيسي',
      event_date: new Date('2026-08-10T18:00:00'),
      capacity: 100,
      organizer_id: organizer1.id,
    });

    // 5. فعالية قادمة تخصصية
    const event5 = await Event.create({
      title: 'ملتقى التوظيف والتطوير المهني السنوي',
      description:
        'فرصة متميزة للتواصل المباشر مع ممثلي أكبر الشركات والجهات لاستكشاف فرص التدريب الصيفي والتوظيف المباشر.',
      location: 'الساحة المركزية بالحرم الجامعي',
      event_date: new Date('2026-10-05T09:00:00'),
      capacity: 200,
      organizer_id: organizer2.id,
    });

    // 6. ورشة تصميم
    const event6 = await Event.create({
      title: 'دورة التصميم الجرافيكي وتجربة المستخدم UI/UX',
      description:
        'تعلم التفكير التصميمي وإعداد واجهات المستخدم الاحترافية باستخدام أدوات Figma وتطبيقات التفاعل الحديثة.',
      location: 'قاعة الفنون والتصميم',
      event_date: new Date('2026-09-10T16:00:00'),
      capacity: 15,
      organizer_id: organizer1.id,
    });

    console.log('Creating demo registrations...');

    // تسجيلات لـ event1 (متاحة)
    await Registration.create({ user_id: user1.id, event_id: event1.id, status: 'confirmed' });
    await Registration.create({ user_id: user2.id, event_id: event1.id, status: 'confirmed' });

    // تسجيلات لـ event2 (محدودة: 3 مسجلين من سعة 5 -> متبقي 2)
    await Registration.create({ user_id: user1.id, event_id: event2.id, status: 'confirmed' });
    await Registration.create({ user_id: user2.id, event_id: event2.id, status: 'confirmed' });
    await Registration.create({ user_id: user3.id, event_id: event2.id, status: 'confirmed' });

    // تسجيلات لـ event3 (مكتملة: 2 مسجلين من سعة 2 -> متبقي 0)
    await Registration.create({ user_id: user1.id, event_id: event3.id, status: 'confirmed' });
    await Registration.create({ user_id: user2.id, event_id: event3.id, status: 'confirmed' });

    // تسجيلات لـ event4 (منتهية)
    await Registration.create({ user_id: user3.id, event_id: event4.id, status: 'confirmed' });

    console.log('\n✅ Demo Data Seeded Successfully!');
    console.log('--------------------------------------------------');
    console.log('Organizer Login: ahmed@organizer.com / Password123!');
    console.log('Organizer Login: sara@organizer.com  / Password123!');
    console.log('User Login:      ali@user.com        / Password123!');
    console.log('User Login:      mariam@user.com     / Password123!');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedData();
