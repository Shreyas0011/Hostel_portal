// src/utils/db.js

const FIRST_NAMES = [
  "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Krishna", "Ishaan", "Shaurya", "Pranav", "Aryan",
  "Kabir", "Rohan", "Rahul", "Ananya", "Diya", "Isha", "Riya", "Aanya", "Kavya", "Sanya",
  "Pooja", "Neha", "Amit", "Sumit", "Vikram", "Sneha", "Aditi", "Meera", "Karan", "Siddharth",
  "Dev", "Rudra", "Varun", "Rishi", "Yash", "Tanvi", "Shruti", "Avani", "Ridhi", "Mehak"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Mehra", "Joshi", "Patel", "Reddy", "Rao", "Nair", "Iyer",
  "Singh", "Kumar", "Chawla", "Sen", "Das", "Roy", "Bose", "Mishra", "Pandey", "Choudhury",
  "Pillai", "Naidu", "Gill", "Kapoor", "Malhotra", "Mehta", "Bhat", "Dubey", "Trivedi", "Saxena"
];

const BLOCKS = ["A", "B", "C", "D"];

const SHARING_TYPE = { '01': 3, '02': 3, '03': 2, '04': 2 };
const BED_LABELS_2 = ['Bed A', 'Bed B'];
const BED_LABELS_3 = ['Bed A', 'Bed B', 'Bed C'];

// // // ─────────────────────────────────────────────────────────────────────────────
// REAL STUDENT ROSTER — EXACTLY 62 STUDENTS (29 Girls + 33 Boys)
// ─────────────────────────────────────────────────────────────────────────────
const REAL_STUDENTS = [
  // ── GIRLS (29 students) ──
  { firstName:'Kumuda',         lastName:'J M',        usn:'251D1482', division:'II B.Com - H',   gender:'Female', dob:'26-02-2007', phone:'7899532402', parentPhone:'7899062439', parentRelation:'Father', parentEmail:'chandanamahadimane@gmail.com',  parentName:'Parent of Kumuda',         address:'D/o Manjunath J N, Anaveri, PO: Dist: Shimoga, Karnataka - 577243', allergies:'', isNew:false },
  { firstName:'Shriya',         lastName:'Vikram Sreerama', usn:'251P1456', division:'II PU - Com',     gender:'Female', dob:'27-11-2009', phone:'6360206591', parentPhone:'9036096077', parentRelation:'Father', parentEmail:'Sreeramavikram@gmail.com',          parentName:'Parent of Shriya',         address:'6-2-68/6 Amarkhed Layout, Near Polytechnic Cleege veer svarkar circle Rachur.', allergies:'', isNew:false },
  { firstName:'Chinmayi',       lastName:'P Kalal',    usn:'251P2129', division:'II PU - Com',     gender:'Female', dob:'21-05-2009', phone:'9019977899', parentPhone:'7676625514', parentRelation:'Father', parentEmail:'kanchu.pr@icloud.com',                 parentName:'Parent of Chinmayi',       address:'Shri Renuka Novas, Opposite SBI Bank, Behind Union Bank, Anugeri Dist: Dharward', allergies:'', isNew:false },
  { firstName:'H G',            lastName:'Rohini',     usn:'251P1636', division:'II PU - Com',     gender:'Female', dob:'27-03-2009', phone:'9019845091', parentPhone:'9741493861', parentRelation:'Father', parentEmail:'nagasairohini@gmail.com',        parentName:'Parent of Rohini',         address:'646, Raja Sampangi Rama Setty Road, Bangarapet - 563114', allergies:'', isNew:false },
  { firstName:'Kurudi',         lastName:'Sai Rithika', usn:'251P2209', division:'II PU - Com',     gender:'Female', dob:'05-02-2010', phone:'9154247752', parentPhone:'8431089882', parentRelation:'Father', parentEmail:'saishresta2002@gmail.com',        parentName:'Parent of Kurudi',         address:'Utakaru Pangi Mandal, Sri Satya Sai District, Anantapuram', allergies:'', isNew:false },
  { firstName:'Kushadi',        lastName:'G',          usn:'251P2201', division:'II PU - Com',     gender:'Female', dob:'23-06-2009', phone:'8660314771', parentPhone:'9448238188', parentRelation:'Father', parentEmail:'girishhsn@gmail.com',              parentName:'Parent of Kushadi',        address:'D/o Girish S R, Sree Lakshmi Nilaya, 3rd Main Road, Vidyuth Nagar, Hassan - 573201', allergies:'', isNew:false },
  { firstName:'G',              lastName:'Charika (New)', usn:'251P1845', division:'II PU - Com',   gender:'Female', dob:'21-05-2009', phone:'9113968809', parentPhone:'9632374507', parentRelation:'Father', parentEmail:'gutharoopa7@gmail.com',            parentName:'Parent of Charika',        address:'#45, 1st Main road, 6th block, Banashankari 3rd stage, near kamakya, behind croma, Banashankari 3rd stage, Bangalore - 560085', allergies:'', isNew:true },
  { firstName:'Nidhishree',     lastName:'R',          usn:'251P1897', division:'II PU - SCI - IIT', gender:'Female', dob:'31-10-2008', phone:'8951359194', parentPhone:'9448539360', parentRelation:'Father', parentEmail:'keerthiravi968@gmail.com',       parentName:'Parent of Nidhishree',     address:'Rathna Nivas, Opposite of Kalikamba Temple Kote, Holenarasipura', allergies:'', isNew:false },
  { firstName:'R',              lastName:'Shravya',    usn:'251P2162', division:'II PU - SCI - KCET', gender:'Female', dob:'14-09-2009', phone:'7022158949', parentPhone:'9844379830', parentRelation:'Father', parentEmail:'raghavendrala123@gmail.com',       parentName:'Parent of Shravya',        address:'Santhrupthi, House No 2, Second Main Road. Gandhi Nagar, Tumkur', allergies:'', isNew:false },
  { firstName:'Shirivalam',      lastName:'Rooparchana', usn:'251P2524', division:'II PU - SCI - KCET', gender:'Female', dob:'04-03-2010', phone:'9972539805', parentPhone:'9490539805', parentRelation:'Father', parentEmail:'shrivalmshantiprasads@gmail.com',   parentName:'Parent of Rooparchana',    address:'8-1-22/1 BTP road Raydurga AP - 515865', allergies:'', isNew:false },
  { firstName:'K R',            lastName:'Vrinda',     usn:'261P3090', division:'I PU - Com',     gender:'Female', dob:'09.12.2010', phone:'8309029563', parentPhone:'9440012838', parentRelation:'Father', parentEmail:'strading109@gmail.com',             parentName:'Parent of Vrinda',         address:'7-2-39, Behind Lakshmi theater, Dhanalakshmi road, Hindupur, Sathya said dist, AP - 515201', allergies:'', isNew:true },
  { firstName:'Nikhitha',       lastName:'Y V',        usn:'261P3266', division:'I PU - Com',     gender:'Female', dob:'01-01-2011', phone:'6361125881', parentPhone:'9742582233', parentRelation:'Mother', parentEmail:'RASHYV@GMAIL.COM',                 parentName:'Parent of Nikhitha',       address:'AEH 16, Opposite Union Bank, N R Extension, Chintamani, Chikkaballapur District - 563125', allergies:'', isNew:true },
  { firstName:'Sai Kruthi',     lastName:'K',          usn:'261P3397', division:'I PU - Com',     gender:'Female', dob:'24.11.2010', phone:'',           parentPhone:'8660772205', parentRelation:'Mother', parentEmail:'karthikkothamachu.kr@gmail.com', parentName:'Parent of Sai Kruthi',     address:'Venkatadri Nilaya, 6th cross, 1st main, Pitel balaramaiah Layout, Anjani extn, Chintamani, Chikkaballapur dist - 563125', allergies:'', isNew:true },
  { firstName:'B S',            lastName:'Yuktha',     usn:'261P3436', division:'I PU - Com',     gender:'Female', dob:'22.07.2010', phone:'7416745509', parentPhone:'9849212259', parentRelation:'Father', parentEmail:'shankarbysani81@gmail.com',        parentName:'Parent of Yuktha',         address:'15-3-9, Main road, Hindupur AP- 515201', allergies:'', isNew:true },
  { firstName:'Sripuram',       lastName:'Krithika',   usn:'261P3336', division:'I PU - Com',     gender:'Female', dob:'04.01.2010', phone:'9063003787', parentPhone:'9000499936', parentRelation:'Father', parentEmail:'k.palamaner@gmail.com',              parentName:'Parent of Krithika',       address:'Sripuram Kishore, 24-25/4, 1st floor, Ayyakanna Street, Palamaner AP - 517408', allergies:'', isNew:true },
  { firstName:'Deethya',         lastName:'Bhagath',    usn:'261P3486', division:'I PU - Com',     gender:'Female', dob:'16.11.2010', phone:'8431247329', parentPhone:'7483334844', parentRelation:'Mother', parentEmail:'pallavibhagath091@gmail.com',       parentName:'Parent of Deethya',         address:'Bhagath H B, Coffee Planter, Nisarga Estate, Kaandi Village & Post, Chickmagalur taluk, 577111', allergies:'NA', isNew:true },
  { firstName:'Nishchita',      lastName:'K S',        usn:'261P3176', division:'I PU - Com',     gender:'Female', dob:'05.11.2009', phone:'6364860395', parentPhone:'9886060895', parentRelation:'Mother', parentEmail:'nalina.srtyres@gmail.com',          parentName:'Parent of Nishchita',      address:'Sri Rama krupa, Ramana block, near rama mandir, Kunigal 572130', allergies:'NA', isNew:true },
  { firstName:'Tanvi',          lastName:'M',          usn:'261P3292', division:'I PU - Com',     gender:'Female', dob:'14.09.2010', phone:'8105177708', parentPhone:'9886149640', parentRelation:'Mother', parentEmail:'rainvasudha@gmail.com',            parentName:'Parent of Tanvi',          address:'Dr.Rajesh, TA-102, Sanjeevani Apartment, Shankar hill township, Toranagallu, Bellary dist - 583123', allergies:'', isNew:true },
  { firstName:'B Sree Venya',   lastName:'Reddy',      usn:'261P3233', division:'I PU - Com',     gender:'Female', dob:'27.10.2010', phone:'6309127447', parentPhone:'8790907325', parentRelation:'Mother', parentEmail:'challa999@gmail.com',               parentName:'Parent of Sree Venya',     address:'Flat No. 102, IInd floor, Shasikanth Mansion, Ganesh Nagar, Kurnool, AP - 518002', allergies:'NA', isNew:true },
  { firstName:'Moulya Surag',   lastName:'S',          usn:'261P3561', division:'I PU - Com',     gender:'Female', dob:'28.02.2010', phone:'',           parentPhone:'9738780672', parentRelation:'Mother', parentEmail:'suragkmm5@gmail.com',             parentName:'Parent of Moulya Surag',   address:'Subramani, Krishna Nilaya, Kumbarpete, Malur, Kolar 563130', allergies:'NA', isNew:true },
  { firstName:'Srida',          lastName:'H M',        usn:'261P3649', division:'I PU - Com',     gender:'Female', dob:'18.11.2009', phone:'8951067733', parentPhone:'9538992860', parentRelation:'Mother', parentEmail:'saanvihm3@gmail.com',               parentName:'Parent of Srida',          address:'#4270, Sri Saa, 1st floor, 2nd cross, V P extension, Chitradurga - 577501', allergies:'', isNew:true },
  { firstName:'T K',            lastName:'Griha',      usn:'261P3708', division:'I PU - Com',     gender:'Female', dob:'24.08.2010', phone:'6304582995', parentPhone:'9440512995', parentRelation:'Father', parentEmail:'thathakarthik3@gmail.com',          parentName:'Parent of Griha',          address:'9-1-1/4, Giridhama, R S Road, Hindupur, B T Layout, AP - 515201', allergies:'', isNew:true },
  { firstName:'Parinitha Gowda', lastName:'M B',        usn:'261P3667', division:'I PU - Com',     gender:'Female', dob:'19.09.2009', phone:'9148186969', parentPhone:'9844633104', parentRelation:'Mother', parentEmail:'tejaswinibaskar@gmail.com',          parentName:'Parent of Parinitha',      address:'#1098, 13th cross, 1st block, Jnanabharathi Layout, Bangalore 560059', allergies:'NA', isNew:true },
  { firstName:'Nonia',          lastName:'Sadashiva',  usn:'261P3881', division:'I PU - Com',     gender:'Female', dob:'08.02.2010', phone:'6360714898', parentPhone:'9880896689', parentRelation:'Father', parentEmail:'sgurunajappa@gmail.com',             parentName:'Parent of Nonia',          address:'#151, 1st Cross, FCI Godown main road, Chinnappa Colony, Vijinapura, Dooravaninagar, Bangalore - 560016', allergies:'', isNew:true },
  { firstName:'B',              lastName:'Lahari',     usn:'261P3894', division:'I PU - Com',     gender:'Female', dob:'20.11.2010', phone:'9347233312', parentPhone:'9985011135', parentRelation:'Mother', parentEmail:'ramyabellamkonda6625@gmail.com',     parentName:'Parent of Lahari',         address:'B Kishore, #3/94, Meda street, Kalyandurgam, Ananthpuram', allergies:'NA', isNew:true },
  { firstName:'Ankitha',        lastName:'N L',        usn:'261P3915', division:'I PU - Com',     gender:'Female', dob:'10.06.2010', phone:'8431973367', parentPhone:'9901672526', parentRelation:'Mother', parentEmail:'bpanitha62@gmail.com',              parentName:'Parent of Ankitha',        address:'T4, 4th Floor, Manifest elite e, Cholnayakahalli, Hebbal, Bengaluru 560032', allergies:'NA', isNew:true },
  { firstName:'Sreemayi',       lastName:'K S',        usn:'261P3914', division:'I PU - Com',     gender:'Female', dob:'06.06.2010', phone:'7396715295', parentPhone:'8309013478', parentRelation:'Father', parentEmail:'jyosree1980@gmail.com',               parentName:'Parent of Sreemayi',       address:'K K Sreedhar, D No. 7-9-33/B, Upstrains, Opp head post office lane, Panduranga nagar, Hindupur - 515201', allergies:'', isNew:true },
  { firstName:'Gopika',         lastName:'Sarayu',     usn:'261P4046', division:'I PU - Com',     gender:'Female', dob:'01.07.2010', phone:'8019044694', parentPhone:'8328400664', parentRelation:'Father', parentEmail:'sunilpabbathi75@gmail.com',         parentName:'Parent of Gopika',         address:'9/332, Gandhi road, Kadapa dist, Nempali, AP 516329', allergies:'NA', isNew:true },
  { firstName:'B',              lastName:'Hansika',    usn:'261P4168', division:'I PU - Com',     gender:'Female', dob:'07.05.2011', phone:'9347330425', parentPhone:'7729920277', parentRelation:'Father', parentEmail:'balaparigi@rediffmail.com',          parentName:'Parent of Hansika',        address:'Housing Board colony, Opposite to Panchagany Pariwar apartment, Hindupur - 515201', allergies:'', isNew:true },

  // ── BOYS (33 students) ──
  { firstName:'Donthi',         lastName:'Rithvik',    usn:'251P2094', division:'II BBA',         gender:'Male',   dob:'08-02-2007', phone:'6304806836', parentPhone:'6301075563', parentRelation:'Father', parentEmail:'donthisirisha76@gmail.com',        parentName:'Parent of Donthi Rithvik', address:'D V R Textorium, Girls High school road. 3/35, Gorantla 515231, Satya sai district, Andhra Pradesh', allergies:'', isNew:false },
  { firstName:'Akash',          lastName:'K R',        usn:'241d1963', division:'III B.Com - E',  gender:'Male',   dob:'17-06-2006', phone:'9740134669', parentPhone:'9845709183', parentRelation:'Father', parentEmail:'punithraj.a46@gmail.com',            parentName:'Parent of Akash',          address:'N. 298/3, 8th cross, 6th block, 2nd stage, nagarbhavi, bengaluru 560072', allergies:'', isNew:false },
  { firstName:'Manas',          lastName:'L R',        usn:'261d2149', division:'I B.COM - P',    gender:'Male',   dob:'11-02-2009', phone:'9042280900', parentPhone:'9362076140', parentRelation:'Father', parentEmail:'swarag2304@gmail.com',             parentName:'Parent of Manas',          address:'Sai Ram Agencies No. 102 Nehru Street, Denkanikotta, Nehru Street , Krishnagiri, TN - 635107', allergies:'', isNew:true },
  { firstName:'Angad Akshar',   lastName:'Sridhar',    usn:'251P1540', division:'II PU - Com',    gender:'Male',   dob:'23-07-2009', phone:'9908753235', parentPhone:'9849036234', parentRelation:'Father', parentEmail:'sridharsampath@gmail.com',           parentName:'Parent of Angad Akshar',   address:'Villa No 85, Under the sun, Behind CAE Building, IVC Road, Devanahalli, Bangalore - 562110', allergies:'', isNew:false },
  { firstName:'Thanmai',        lastName:'M.N',        usn:'251P1307', division:'II PU - Com',    gender:'Male',   dob:'10-03-2009', phone:'8792835096', parentPhone:'9448156583', parentRelation:'Father', parentEmail:'niranjanannappa@yahoo.com',         parentName:'Parent of Thanmai',        address:'Niranjan Advocate Vinayaka Nilaya, Behind FMKML College, Galibeedu Road, Madikeri Kodagu - 571201', allergies:'', isNew:false },
  { firstName:'Deep G',         lastName:'Patel',      usn:'251P1611', division:'II PU - Com',    gender:'Male',   dob:'28-02-2009', phone:'9513965143', parentPhone:'9448680143', parentRelation:'Father', parentEmail:'gautam10681@gmail.com',             parentName:'Parent of Deep G Patel',   address:'Mathrushree Nilaya, Jyothi Nagar, Manjunath Layout, Megadi Ramanagara', allergies:'', isNew:false },
  { firstName:'Chiranth Gowda', lastName:'D',          usn:'251P2234', division:'II PU - Com',    gender:'Male',   dob:'18-06-2009', phone:'6363604456', parentPhone:'7760105454', parentRelation:'Father', parentEmail:'druvakumars54@gmail.com',            parentName:'Parent of Chiranth Gowda', address:'#78, Shree seetharama Nilaya, T B Extension, Nagamangala, Mandya - 571432', allergies:'', isNew:false },
  { firstName:'Srijan',         lastName:'P S',        usn:'251P1316', division:'II PU - Com',    gender:'Male',   dob:'23-11-2009', phone:'9980113837', parentPhone:'9844573838', parentRelation:'Father', parentEmail:'sreenathp1975@gmail.com',            parentName:'Parent of Srijan',         address:'#812, Venkatadri, 1st Main, 3rd cross, Shankarappa layout Tiptur - 572201', allergies:'', isNew:false },
  { firstName:'Jishnu',         lastName:'C A',        usn:'251P1600', division:'II PU - Com',    gender:'Male',   dob:'25-07-2008', phone:'7892968470', parentPhone:'9986911204', parentRelation:'Father', parentEmail:'abhijith163@yahoo.co.in',            parentName:'Parent of Jishnu',         address:'#340Behind saibaba temple, II main KR Extn Tiptur - 572201 Tumkur District', allergies:'', isNew:false },
  { firstName:'Guduru',         lastName:'Siddharth',  usn:'251P1315', division:'II PU - Com',    gender:'Male',   dob:'28-07-2009', phone:'7981931516', parentPhone:'9848611669', parentRelation:'Father', parentEmail:'guduru.subramanyam2011@gmail.com',  parentName:'Parent of Guduru',         address:'D No: 4-41A1, Bramhin Street, Penukonda 515110, Sathya Sai District Andra Pradesh', allergies:'', isNew:false },
  { firstName:'Arnav',          lastName:'Panjiyar',   usn:'251P2024', division:'II PU - Com',    gender:'Male',   dob:'30-06-2009', phone:'7739120952', parentPhone:'7909018295', parentRelation:'Father', parentEmail:'upanjiyar@gmail.com',              parentName:'Parent of Arnav',          address:'Subhash Chowk, Madhubani, Bihar Pincode - 847211', allergies:'', isNew:false },
  { firstName:'Krishna A',      lastName:'Rangani',    usn:'251P1886', division:'II PU - Com',    gender:'Male',   dob:'26-05-2009', phone:'7550306330', parentPhone:'9787086660', parentRelation:'Father', parentEmail:'ambrishrangani@gmail.com',           parentName:'Parent of Krishna A',      address:'1/516, Tenkasi Road Piranoor Border, sitencottah 627809 Tenkasi Dist Tamilnadu', allergies:'', isNew:false },
  { firstName:'Saiswaroop',     lastName:'S Phattepur', usn:'251P2010', division:'II PU - Com',    gender:'Male',   dob:'12-11-2009', phone:'8310234450', parentPhone:'9663415050', parentRelation:'Father', parentEmail:'phattepursanjana@gmail.com',        parentName:'Parent of Saiswaroop',     address:'Shashikanth Phattepur, Sarap Merchant, Junipeth road, Ramdurga - 591123', allergies:'', isNew:false },
  { firstName:'G Rahul Raj',    lastName:'Reddy',      usn:'251P2529', division:'II PU - Com',    gender:'Male',   dob:'08-12-2008', phone:'7483811445', parentPhone:'9844427582', parentRelation:'Father', parentEmail:'binduguldas@gmail.com',             parentName:'Parent of Rahul Raj',      address:'Guldas Nagaraj, H NO 10-8-18, Makthal Pet Near Nilekanteshwar Temple, Raichur Karnataka - 584101', allergies:'', isNew:false },
  { firstName:'Tanish',         lastName:'Asuru',      usn:'251P2536', division:'II PU - Com',    gender:'Male',   dob:'13-07-2008', phone:'6294143332', parentPhone:'9886626183', parentRelation:'Father', parentEmail:'jothirao@gmail.com',               parentName:'Parent of Tanish',         address:'No.7, 8th Cross, KSR Main Road, Kalkere, Horamavu, Bangalore - 560043', allergies:'', isNew:false },
  { firstName:'Utkarsh',        lastName:'Bhardwaj',  usn:'251P2548', division:'II PU - Com',    gender:'Male',   dob:'22-02-2009', phone:'7905926122', parentPhone:'6205179080', parentRelation:'Father', parentEmail:'shivangibhardwaj02000@gmail.com',   parentName:'Parent of Utkarsh',        address:'Jahanabad, post kudra Jahanabad, Kaimur (Bhbuq)', allergies:'', isNew:false },
  { firstName:'Dhruv P',        lastName:'Patel',      usn:'251P1722', division:'II PU - Com',    gender:'Male',   dob:'08-09-2008', phone:'9972788123', parentPhone:'9902292800', parentRelation:'Mother', parentEmail:'prpokar83@gmail.com',               parentName:'Parent of Dhruv P',        address:'Raaj and Co. Near Prasanna Theatre, Magadi Road, Bengaluru - 560023', allergies:'', isNew:true },
  { firstName:'Mohit Milind',   lastName:'Kulkarni',   usn:'261P3053', division:'I PU - Com',     gender:'Male',   dob:'29.10.2009', phone:'9356187277', parentPhone:'7798128511', parentRelation:'Mother', parentEmail:'archanakulkarnib@gmail.com',        parentName:'Parent of Mohit Milind',   address:'Synapse Nest, Flat No. 202, ITPL Main road, BEML Layout, Brookefield, Bangalore 560037', allergies:'NA', isNew:true },
  { firstName:'R V',            lastName:'Vedanth',    usn:'261P3453', division:'I PU - Com',     gender:'Male',   dob:'27.10.2010', phone:'9677828722', parentPhone:'9443688722', parentRelation:'Father', parentEmail:'venkateshbabu722@gmail.com',      parentName:'Parent of Vedanth',        address:'2/A3, Jail Street, 1st Cross, Denkanikotta, Tamilnadu, 635107', allergies:'Eye problem (retina)', isNew:true },
  { firstName:'Sujay Arun',     lastName:'Muchherla',  usn:'261P3483', division:'I PU - Com',     gender:'Male',   dob:'09.10.2010', phone:'7019175625', parentPhone:'9880574575', parentRelation:'Mother', parentEmail:'navyakalyan3@gmail.com',            parentName:'Parent of Sujay Arun',     address:'M A Kalyan, 1/2601, Sreekalasree, N R Extension, Chintamani, 563125', allergies:'NA', isNew:true },
  { firstName:'Nishchal Tejaswi', lastName:'G M',      usn:'261P3175', division:'I PU - Com',     gender:'Male',   dob:'19.07.2010', phone:'7411076289', parentPhone:'9844032346', parentRelation:'Mother', parentEmail:'sushmags@gmail.com',                 parentName:'Parent of Nishchal',       address:'"Sharanya" Near Tomato shed, Maruthi Nagara, Arasikere, Hassan dist, 573103', allergies:'NA', isNew:true },
  { firstName:'Samarth S',      lastName:'Allalli',    usn:'261P3029', division:'I PU - Com',     gender:'Male',   dob:'20.06.2010', phone:'9008080059', parentPhone:'9844000194', parentRelation:'Mother', parentEmail:'chaitravs@gmail.com',               parentName:'Parent of Samarth S',      address:'#5587/23, Gurukrupa, 4th main, 8th cross, S S Layout B Block, Davangere.', allergies:'NA', isNew:true },
  { firstName:'Chidella',       lastName:'Preetham',   usn:'261P3726', division:'I PU - Com',     gender:'Male',   dob:'25.06.2010', phone:'9281455656', parentPhone:'9948078887', parentRelation:'Father', parentEmail:'srravann@gmail.com',                 parentName:'Parent of Chidella',       address:'12/517-2-11, Kasapuram road, Guntakal - 515801', allergies:'NA', isNew:true },
  { firstName:'Deepak',         lastName:'S M',        usn:'261P3791', division:'I PU - Com',     gender:'Male',   dob:'20.09.2010', phone:'9008305471', parentPhone:'9986676471', parentRelation:'Father', parentEmail:'murthypdit@gmail.com',              parentName:'Parent of Deepak',         address:'Deepu Nilaya, 6/4-12-39, Beside social welfare office, Kudligi road, Hagaribommanahalli, Vijayanagar dist, 583212', allergies:'NA', isNew:true },
  { firstName:'Rohith',         lastName:'R',          usn:'261P3874', division:'I PU - Com',     gender:'Male',   dob:'11.09.2010', phone:'6361186959', parentPhone:'9448663609', parentRelation:'Father', parentEmail:'srisaieshwar3@gmail.com',          parentName:'Parent of Rohith',         address:'#965, near jain temple road, Bangarpet taluk, Kolar district, Karnataka', allergies:'NA', isNew:true },
  { firstName:'Samarth',        lastName:'R',          usn:'261P3719', division:'I PU - Com',     gender:'Male',   dob:'26.05.2010', phone:'9886528845', parentPhone:'9900250113', parentRelation:'Father', parentEmail:'Raviprakash29@gmail.com',          parentName:'Parent of Samarth R',      address:'Sri Vijaya Nilasa, Press Reporter, Bhaktanagari, N R Extension, Chintamani, 563125', allergies:'NA', isNew:true },
  { firstName:'Avanish Avadhut', lastName:'Pachapur',  usn:'261P3468', division:'I PU - Com',     gender:'Male',   dob:'05-01-2010', phone:'7892861173', parentPhone:'9606239200', parentRelation:'Mother', parentEmail:'sanjotaavadhut13@gmail.com',        parentName:'Parent of Avanish',        address:'Flat No G 06, Kengeri , Bangalore - 560060', allergies:'', isNew:true },
  { firstName:'Aneesh Sai',     lastName:'K H',        usn:'261P4058', division:'I PU - Com',     gender:'Male',   dob:'25.12.2010', phone:'9663681388', parentPhone:'9480105919', parentRelation:'Mother', parentEmail:'knharishchaitanya@gmail.com',     parentName:'Parent of Aneesh Sai',     address:'Nandi House, Beside Indira Hospital, N R Extension, Chintamani 563125', allergies:'NA', isNew:true },
  { firstName:'Sai Hruday',     lastName:'Kumar G S',  usn:'261P4083', division:'I PU - Com',     gender:'Male',   dob:'06.09.2010', phone:'9880599022', parentPhone:'9449145321', parentRelation:'Father', parentEmail:'shobhagarments95@gmail.com',        parentName:'Parent of Sai Hruday',     address:'Shobhadri Nilaya, behind Raghavendra Swamy temple, G N R Extension, Chintamani - 563125', allergies:'NA', isNew:true },
  { firstName:'Kollu Naga',     lastName:'Sudhir Naidu', usn:'261P4128', division:'I PU - Com',   gender:'Male',   dob:'20.05.2010', phone:'7569814692', parentPhone:'9010245675', parentRelation:'Father', parentEmail:'pvrjagadesh@gmail.com',             parentName:'Parent of Kollu Naga',     address:'2/61a, Ramsainagar, Duvvuri Mandal, YSR Cuddapah district', allergies:'NA', isNew:true },
  { firstName:'Abhiram A',      lastName:'Madhyastha', usn:'261P3921', division:'I PU - Com',     gender:'Male',   dob:'22.02.2010', phone:'8277180306', parentPhone:'7348972675', parentRelation:'Mother', parentEmail:'ushads.madhyastha@gmail.com',      parentName:'Parent of Abhiram',        address:'Sri Vidya, Malige fowdana doddi, Ganalu, Kanakapura 562117', allergies:'NA', isNew:true },
  { firstName:'Ambati Narasimha', lastName:'Sai Sabarish', usn:'261P4176', division:'I PU - Com', gender:'Male',   dob:'18.08.2010', phone:'7337559750', parentPhone:'9182420801', parentRelation:'Father', parentEmail:'ravikumarambati64@gmail.com',        parentName:'Parent of Ambati',         address:'6/387, VRS Colony, R S Road, Rajampeta, Kadapa dist. 516115', allergies:'NA', isNew:true },
  { firstName:'Adithya',        lastName:'Subramanya P', usn:'261P4259', division:'I PU - Com',   gender:'Male',   dob:'31.08.2010', phone:'7483566149', parentPhone:'9448046782', parentRelation:'Father', parentEmail:'saiprasadbabu18@gmail.com',        parentName:'Parent of Adithya',        address:'2nd cross, Opp to smart point, Kurubarapete, Kolar, 563101', allergies:'NA', isNew:true }
];

function getDivisionBlock(gender, div) {
  if (gender === 'Female') {
    return div.includes('I PU') ? 'A' : 'B';
  } else {
    return div.includes('I PU') ? 'C' : 'D';
  }
}
function getSharing(index) {
  return (index % 2) === 0 ? 2 : 3;
}

function generateRandomStudent(index) {
  const entry = REAL_STUDENTS[index - 1];
  if (!entry) return null;

  const { firstName, lastName, usn, division, gender, dob, phone, parentPhone,
    parentRelation, parentEmail, parentName, address, allergies, isNew } = entry;
  const name = lastName ? `${firstName} ${lastName}` : firstName;
  const id = `STU${String(index).padStart(3, '0')}`;

  const block   = getDivisionBlock(gender, division);
  const sharing = getSharing(index);
  const floor   = ((index - 1) % 4) + 1;
  const roomSuffix = sharing === 3 ? ['01','02'][(index-1) % 2] : ['03','04'][(index-1) % 2];
  const room    = `${block}-${floor}${roomSuffix}`;
  const bedLabels = sharing === 3 ? BED_LABELS_3 : BED_LABELS_2;
  const bed     = bedLabels[(index - 1) % bedLabels.length];

  // First 2 = flagship demo accounts with @transcendgroup.org
  const emailDomain = index <= 2 ? 'transcendgroup.org' : 'hostel.edu';
  const eFst = firstName.toLowerCase().replace(/\s+/g, '.');
  const eLst = lastName ? `.${lastName.toLowerCase().replace(/\s+/g, '.')}` : '';
  const email = `${eFst}${eLst}@${emailDomain}`;

  let year = 1;
  if (division.includes('II ')) year = 2;
  else if (division.includes('III ')) year = 3;

  let course = 'Pre-University';
  let dept = division.includes('SCI') ? 'Science' : 'Commerce';
  if (division.includes('B.Com')) {
    course = 'B.Com';
    dept = 'Commerce';
  } else if (division.includes('BBA')) {
    course = 'BBA';
    dept = 'Management';
  }

  return {
    id, name, usn,
    room, block, bed, sharing, division,
    course, dept, year,
    email,
    phone: phone ? `+91 ${phone.slice(0,5)} ${phone.slice(5)}` : '',
    parentPhone: parentPhone ? `+91 ${parentPhone.slice(0,5)} ${parentPhone.slice(5)}` : '',
    parentEmail,
    parentName,
    parentRelation: parentRelation || 'Parent',
    gender: gender || 'Female',
    dob: dob || '',
    address: address || '',
    allergies: allergies || '',
    photo: '', isNew: !!isNew,
    leaves: [], mealBookings: [], complaints: [], mealAttendance: [],
    entryExitLogs: [], healthRecords: [], behaviourLogs: []
  };
}

export function getDateString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const MEAL_BOOKING_CUTOFF_HOUR = 8;

export function getMealBookingDeadline(dateStr) {
  const targetDayCutoff = new Date(`${dateStr}T${String(MEAL_BOOKING_CUTOFF_HOUR).padStart(2, '0')}:00:00`);
  return targetDayCutoff.getTime() - (24 * 60 * 60 * 1000);
}

export function hasMealBookingDeadlinePassed(dateStr) {
  return Date.now() > getMealBookingDeadline(dateStr);
}

let cachedStudentsMemory = null;

export function hasMealBeenRejected(student, dateStr, mealKey) {
  return !!(student.mealCancellations && student.mealCancellations.some(
    c => c.date === dateStr && c.meal === mealKey
  ));
}

export function formatMealBookingDeadline(dateStr) {
  const deadline = new Date(getMealBookingDeadline(dateStr));
  return deadline.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function isStudentOnLeave(student, dateStr) {
  return false;
}

export function isMealBooked(student, dateStr, mealKey) {
  if (!student) return false;
  if (hasMealBeenRejected(student, dateStr, mealKey)) {
    return false;
  }
  return true;
}

export function getMealAcceptanceType(student, dateStr, mealKey) {
  if (!student) return 'opted-out';
  if (hasMealBeenRejected(student, dateStr, mealKey)) return 'rejected';
  const booking = student.mealBookings?.find(b => b.date === dateStr);
  const explicitlyBooked = booking && !!booking[mealKey];
  if (explicitlyBooked) return 'manual';
  return 'auto';
}

export function getMealAttendance(student, dateStr, mealKey) {
  if (!student || !student.mealAttendance) return null;
  const attendance = student.mealAttendance.find(a => a.date === dateStr);
  return attendance ? attendance[mealKey] || null : null;
}

const DB_VERSION = 'v16'; // 62 students (29 girls + 33 boys) — meal attendance seed

export function initDB() {
  const cachedVersion = localStorage.getItem('hostel_portal_db_version');
  const cached = localStorage.getItem('hostel_portal_db');

  if (cachedStudentsMemory && cachedVersion === DB_VERSION) {
    return cachedStudentsMemory;
  }

  if (cached && cachedVersion === DB_VERSION) {
    const parsed = JSON.parse(cached);
    if (parsed.length === REAL_STUDENTS.length) {
      parsed.forEach(student => {
        if (!student.leaves)        student.leaves        = [];
        if (!student.mealBookings)  student.mealBookings  = [];
        if (!student.mealAttendance) student.mealAttendance = [];
        if (!student.complaints)    student.complaints    = [];
        if (!student.entryExitLogs) student.entryExitLogs = [];
        if (!student.healthRecords) student.healthRecords = [];
        if (!student.behaviourLogs) student.behaviourLogs = [];
        if (!student.bed)           student.bed           = 'Bed A';
        if (!student.sharing)       student.sharing       = 2;
        if (!student.division)      student.division      = 'IPL-Can';
        if (!student.gender)        student.gender        = 'Female';
        if (!student.dob)           student.dob           = '';
        if (!student.address)       student.address       = '';
        if (!student.allergies)     student.allergies     = '';
        if (!student.parentPhone)   student.parentPhone   = '';
        if (!student.parentRelation) student.parentRelation = 'Parent';
      });
      cachedStudentsMemory = parsed;
      return parsed;
    }
  }

  localStorage.removeItem('hostel_portal_db');

  // Build all real students from admission spreadsheet
  const students = [];
  for (let i = 1; i <= REAL_STUDENTS.length; i++) {
    students.push(generateRandomStudent(i));
  }

  // Seed meals for all students
  students.forEach(student => {
    student.mealAttendance = [];
    for (let offset = 0; offset < 7; offset++) {
      const date = getDateString(offset);
      if (Math.random() < 0.6) {
        student.mealBookings.push({
          date,
          breakfast: Math.random() < 0.8,
          lunch:     Math.random() < 0.7,
          snacks:    Math.random() < 0.5,
          dinner:    Math.random() < 0.8
        });
      }
    }
  });

  // Seed attendance for students' booked meals in the past/today
  students.forEach(student => {
    const todayStr = getDateString(0);
    for (let offset = -5; offset <= 0; offset++) {
      const date = getDateString(offset);
      const attendance = { date };
      let hasAttendance = false;
      
      ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(mealKey => {
        if (isMealBooked(student, date, mealKey)) {
          if (Math.random() < 0.75) {
            attendance[mealKey] = Math.random() < 0.85 ? 'yes' : 'no';
            hasAttendance = true;
          }
        }
      });
      
      if (hasAttendance) {
        student.mealAttendance.push(attendance);
      }
    }
  });

  // Behaviour logs — STU001 Amulya, STU002 Chinmayi, STU003 Humblee
  students[0].behaviourLogs = [
    { id:'OB-STU001-1', date:getDateString(-5), category:'Academic',   severity:'positive', description:'Represented the hostel in the inter-college quiz and won first place.',    recordedBy:'Ramesh Kumar (Warden)' }
  ];
  students[1].behaviourLogs = [
    { id:'OB-STU002-1', date:getDateString(-6), category:'Academic',   severity:'positive', description:'Secured first rank in the department semester examinations.',             recordedBy:'Anita Joseph (Warden)' },
    { id:'OB-STU002-2', date:getDateString(-1), category:'Social',     severity:'positive', description:'Organized a cultural fest committee meeting in the common room.',         recordedBy:'Campus Admin' }
  ];
  students[2].behaviourLogs = [
    { id:'OB-STU003-1', date:getDateString(-4), category:'Social',     severity:'positive', description:'Volunteered to clean the hostel common room and organize the library.',   recordedBy:'Campus Admin' }
  ];

  // Health records
  students[0].healthRecords = [
    { id:'HR-STU001-1', date:'Mon, Jun 10', time:'09:30 AM', symptoms:'Mild fever, headache', temperature:'99.2°F', status:'Recovered', note:'Given paracetamol. Advised rest for 1 day.' }
  ];
  students[1].healthRecords = [
    { id:'HR-STU002-1', date:'Wed, Jun 18', time:'11:00 AM', symptoms:'Cold, sore throat',   temperature:'98.6°F', status:'Recovered', note:'Prescribed antihistamine. Fully recovered.' }
  ];

  // Complaints
  students[0].complaints = [
    { id:'CMP-STU001-1', category:'Internet',    subject:'Wi-Fi not working in Room B-103',  details:'The Wi-Fi router on floor 1 Block B has been down since Monday morning.', status:'Pending', dateReported:getDateString(-3), attachments:[] },
    { id:'CMP-STU001-2', category:'Maintenance', subject:'Leaking tap in bathroom',           details:'The bathroom tap in the cabin has been leaking for 3 days.',              status:'Closed',  dateReported:getDateString(-8), attachments:[] }
  ];
  students[1].complaints = [
    { id:'CMP-STU002-1', category:'Mess', subject:'Food quality issue – dinner', details:'Dinner on Thursday was undercooked and tasted stale.', status:'Pending', dateReported:getDateString(-2), attachments:[] }
  ];

  saveDB(students);
  return students;
}

export function saveDB(students) {
  cachedStudentsMemory = students;
  localStorage.setItem('hostel_portal_db', JSON.stringify(students));
  localStorage.setItem('hostel_portal_db_version', DB_VERSION);
}

export function getWardenDashboardStats(students) {
  const total = students.length;
  const todayStr = getDateString(0);
  const tomorrowStr = getDateString(1);

  let onLeaveToday = 0;
  students.forEach(student => {
    if (isStudentOnLeave(student, todayStr)) {
      onLeaveToday++;
    }
  });

  let pendingLeaves = 0;
  students.forEach(student => {
    student.leaves.forEach(leave => {
      if (leave.status === 'pending') {
        pendingLeaves++;
      }
    });
  });

  const todayMeals = getAnalyticsForDate(students, todayStr);
  const tomorrowMeals = getAnalyticsForDate(students, tomorrowStr);

  const avoidedMeals = parseInt(localStorage.getItem('hostel_avoided_meals') || '142', 10);

  return {
    totalStudents: total,
    inHostel: total - onLeaveToday,
    onLeaveToday,
    pendingLeaves,
    todayMeals,
    tomorrowMeals,
    avoidedMeals
  };
}

export function getAnalyticsForDate(students, dateStr) {
  let breakfast = 0;
  let lunch = 0;
  let snacks = 0;
  let dinner = 0;

  students.forEach(student => {
    if (isMealBooked(student, dateStr, 'breakfast')) breakfast++;
    if (isMealBooked(student, dateStr, 'lunch')) lunch++;
    if (isMealBooked(student, dateStr, 'snacks')) snacks++;
    if (isMealBooked(student, dateStr, 'dinner')) dinner++;
  });

  return { breakfast, lunch, snacks, dinner };
}

export function getBedAssignments(students) {
  const rooms = {};
  students.forEach(s => {
    if (!rooms[s.room]) {
      rooms[s.room] = { room: s.room, block: s.block, sharing: s.sharing || 2, occupants: [] };
    }
    rooms[s.room].occupants.push({ id: s.id, name: s.name, bed: s.bed || 'Bed A' });
  });
  return Object.values(rooms).sort((a, b) => a.room.localeCompare(b.room));
}

export function logEntryExit(studentId, type, note = '') {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  if (!student.entryExitLogs) student.entryExitLogs = [];

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const logEntry = {
    id: `LOG-${studentId}-${Date.now()}`,
    type,
    timestamp,
    note: note || (type === 'entry' ? 'Hostel entry' : 'Hostel exit')
  };

  student.entryExitLogs.push(logEntry);
  saveDB(students);
  return { students, log: logEntry };
}

export function updateBehaviourLog(studentId, logData, actionType = 'add') {
  const students = initDB();
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  if (!student.behaviourLogs) {
    student.behaviourLogs = [];
  }

  if (actionType === 'add') {
    const newLog = {
      id: `OB-${studentId}-${Date.now()}`,
      date: logData.date || getDateString(0),
      category: logData.category,
      severity: logData.severity,
      description: logData.description,
      recordedBy: logData.recordedBy || 'System'
    };
    student.behaviourLogs.push(newLog);
  } else if (actionType === 'edit') {
    const logIndex = student.behaviourLogs.findIndex(l => l.id === logData.id);
    if (logIndex >= 0) {
      student.behaviourLogs[logIndex] = {
        ...student.behaviourLogs[logIndex],
        category: logData.category,
        severity: logData.severity,
        description: logData.description,
        date: logData.date || student.behaviourLogs[logIndex].date
      };
    }
  } else if (actionType === 'delete') {
    student.behaviourLogs = student.behaviourLogs.filter(l => l.id !== logData.id);
  }

  saveDB(students);
  return { success: true, students };
}

export { REAL_STUDENTS, DB_VERSION, generateRandomStudent };

