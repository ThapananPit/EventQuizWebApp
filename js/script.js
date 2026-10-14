/* ============================================================
   DATA — เนื้อเรื่องโจทย์ที่ 1: ร้านค้าออนไลน์ที่เขียนเอง
   (ตัวเลข user/คะแนนเป็นค่าจำลองเพื่อการเรียนรู้ ไม่ใช่สถิติจริง)
   ============================================================ */
const START_USERS=1000, DEAD=200, MAXU=1200;

const NODES={
 start:{
  title:'ออเดอร์ 1 บาท', tag:'ช่องโหว่ในตรรกะร้านค้า', best:'a',
  bestWhy:'ปิดร้านสั้นๆ เพื่อกักกันก่อน แล้วหาต้นเหตุจากหลักฐาน จะเสียลูกค้าน้อยกว่าการแก้มั่วหรือเขียนใหม่ทั้งหมด',
  text:'เช้านี้คุณเปิดหลังร้านของร้านค้าออนไลน์ที่เขียนเอง แล้วพบ 38 ออเดอร์ที่ราคารวมแค่ 1 บาท ทั้งที่สินค้าราคาหลักร้อยถึงหลักพัน ทั้งหมดมาจากบัญชีใหม่ไม่กี่บัญชีภายใน 20 นาที ขณะที่ลูกค้าปกติยังสั่งของอยู่ คุณจะทำอะไรก่อน?',
  choices:[
   {id:'a',label:'ปิดร้านชั่วคราว แล้วตรวจให้แน่ใจก่อนว่าเกิดจากอะไร',q:'good',
    out:'คุณปิดหน้าร้านราว 6 ชั่วโมง ลูกค้าบางคนหงุดหงิดที่สั่งของไม่ได้ แต่ผู้โจมตีก็สั่งเพิ่มไม่ได้แล้ว และคุณมีเวลาอ่าน log โดยไม่ถูกแย่งเขียนทับ',
    u:[[-60,'ปิดร้าน 6 ชั่วโมง ลูกค้าบางส่วนไม่รอ']],trust:5,axes:{sec:1,speed:-1,long:1},
    lesson:'กักกันก่อน (containment): หยุดความเสียหายไม่ให้ลุกลาม แล้วค่อยหาต้นเหตุ การปิดสั้นๆ ที่มีเป้าหมายดีกว่าการแก้สะเปะสะปะทั้งที่ยังไม่รู้สาเหตุ',next:'investigate'},
   {id:'b',label:'ยกเลิกออเดอร์ 1 บาททั้งหมด แล้วเปิดร้านต่อ',q:'bad',
    out:'ทั้งวันดูเงียบสงบ ลูกค้าไม่รู้เรื่องอะไรเลย แต่คุณยังตอบไม่ได้ว่าราคาถูกแก้ได้อย่างไร',
    u:[[0,'ไม่มีผลทันที']],axes:{sec:-1,speed:2,long:-1},
    lesson:'การลบผลลัพธ์ไม่ใช่การแก้ต้นเหตุ ถ้าช่องที่ใช้โจมตียังอยู่ ผู้โจมตีก็แค่ทำซ้ำ',next:'repeat'},
   {id:'c',label:'เปลี่ยนรหัสผ่านแอดมินและบังคับทุกบัญชีตั้งรหัสใหม่ เพราะคิดว่ารหัสผ่านหลุด',q:'mid',
    out:'ลูกค้าที่ถูกบังคับรีเซ็ตรหัสรู้สึกยุ่งยาก และ log ที่คุณอ่านทีหลังจะบอกว่าไม่มีใครขโมยรหัสผ่านเลย',
    u:[[-20,'บังคับรีเซ็ตรหัสผ่าน ลูกค้าบางส่วนเลิกใช้']],axes:{sec:1,speed:1},set:{wrongDx:true},
    lesson:'ตั้งสมมติฐานจากหลักฐาน ไม่ใช่ความรู้สึก ผู้โจมตีไม่ได้เดารหัสผ่าน แต่ฉวยโอกาสจากกฎที่หลวม การแก้ผิดจุดทำให้เสียเวลาและเสียความเชื่อมั่น',next:'repeat'},
   {id:'d',label:'ปิดร้านแล้วเขียนระบบใหม่ทั้งหมดให้ปลอดภัย',q:'mid',
    out:'คุณปิดร้านสองสัปดาห์เพื่อเขียนใหม่ ผู้ใช้เก่าย้ายไปร้านอื่นจำนวนมากระหว่างรอ แต่คุณมั่นใจว่าระบบใหม่จะไม่มีช่องเดิม',
    u:[[-300,'ร้านปิดสองสัปดาห์ ลูกค้าเก่าย้ายไปร้านคู่แข่ง']],trust:-5,axes:{sec:2,speed:-2,long:1},set:{rewrote:true},
    lesson:'การเขียนใหม่ทั้งหมดดูปลอดภัยแต่แพงและเสี่ยง โค้ดที่เร่งทำมักมีช่องโหว่ใหม่ ทางที่คุ้มกว่ามักเป็นหาต้นเหตุแล้วแก้เฉพาะจุดอย่างถูกต้อง',next:'rewrite'}
  ]},

 investigate:{
  title:'ค้นหาต้นเหตุ', tag:'วิเคราะห์เหตุ', best:'a',
  bestWhy:'ต้นเหตุมีสองจุดพร้อมกัน ต้องปิดทั้งสอง จึงจะไม่ถูกโจมตีซ้ำผ่านช่องที่เหลือ',
  text:'จาก log คุณพบว่าผู้โจมตีไม่ได้เจาะรหัสผ่านใครเลย เขาเปิด DevTools ในเบราว์เซอร์ แล้วส่งคำสั่งสร้างออเดอร์เข้าฐานข้อมูลตรงๆ พร้อมกำหนดราคาเอง ต้นเหตุมีสองอย่างพร้อมกัน (1) กฎการเข้าถึงฐานข้อมูล (Rules) ยอมให้ผู้ล็อกอินทุกคนเขียนออเดอร์ได้ทุกช่อง และ (2) ราคารวมถูกคำนวณในเบราว์เซอร์ แล้วส่งมาให้ระบบเชื่อโดยไม่ตรวจ คุณจะแก้อย่างไร?',
  choices:[
   {id:'a',label:'แก้ Rules ให้เขียนได้เฉพาะช่องที่จำเป็น และย้ายการคำนวณราคา/ชำระเงินมาไว้ที่ Server แล้วค่อยเปิดร้าน',q:'good',
    out:'คุณใช้เวลาหนึ่งวันแก้ Rules ให้ผู้ใช้ส่งได้เฉพาะรายการสินค้าและจำนวน ส่วนราคาให้ Server อ่านจากฐานข้อมูลสินค้าแล้วคำนวณเอง จากนั้นลองแก้ราคาด้วยตัวเองหลายวิธี ปรากฏว่าทำไม่ได้แล้ว',
    u:[[-20,'ปิดร้านเพิ่มอีกครึ่งวัน']],trust:10,axes:{sec:2,long:2,speed:-1},set:{rulesFixed:true,serverMoney:true},
    lesson:'หลักสำคัญ: อย่าเชื่อข้อมูลจากฝั่ง client เรื่องเงินและสิทธิ์ต้องตัดสินที่ Server และ Rules ควรอนุญาตเท่าที่จำเป็นเท่านั้น (least privilege)',next:'wave2'},
   {id:'b',label:'แก้เฉพาะ Rules ให้เข้มงวดก่อน เรื่องคำนวณราคาไว้ค่อยทำทีหลัง',q:'mid',
    out:'Rules ใหม่กันการเขียนตรงเข้าฐานข้อมูลได้ คุณเปิดร้านเร็วกว่าแผน แต่หน้าชำระเงินยังเชื่อราคาที่เบราว์เซอร์ส่งมา',
    u:[[-10,'ปิดร้านสั้นๆ']],trust:5,axes:{sec:1,speed:1,long:-1},set:{rulesFixed:true},
    lesson:'การแก้ครึ่งทางสร้างความรู้สึกว่าปลอดภัยแล้ว ทั้งที่ช่องที่สองยังเปิดอยู่ ต้องไล่ปิดให้ครบทุกต้นเหตุที่พบ',next:'partialClient'},
   {id:'c',label:'ย้ายการคำนวณราคามา Server ก่อน ส่วน Rules ปล่อยไว้ เพราะกลัวแก้แล้วระบบพัง',q:'mid',
    out:'ราคาถูกคำนวณที่ Server แล้ว ออเดอร์ 1 บาทหมดไป คุณเปิดร้านต่อโดยไม่ได้แตะ Rules ที่ยังเปิดกว้างอยู่',
    u:[[-10,'ปิดร้านสั้นๆ']],axes:{speed:1,long:-1},set:{serverMoney:true},
    lesson:'ความกลัวว่าจะพังไม่ควรกลายเป็นเหตุผลให้เว้นช่องโหว่ ให้ทดสอบกับสำเนาก่อนแล้วแก้ ไม่ใช่ปล่อยไว้',next:'partialRules'}
  ]},

 partialClient:{
  title:'ช่องที่สองถูกใช้', tag:'โจมตีซ้ำ: ราคาจาก client', best:'a',
  bestWhy:'ต้องย้ายการคิดราคาไป Server จริงๆ การตรวจฝั่งเบราว์เซอร์ผู้โจมตีข้ามได้เสมอ',
  text:'ห้าวันต่อมา Rules ใหม่กันการเขียนตรงเข้าฐานข้อมูลได้ แต่ผู้โจมตีเปลี่ยนวิธี เขาแก้ค่าราคาในคำขอชำระเงินที่หน้าเว็บส่งมา ซึ่งระบบยังเชื่อ เขาได้สินค้า 12 ชิ้นในราคาถูกมาก ร้านขาดทุนและสินค้าหมดสต็อก',
  enter:s=>({u:[[-90,'สินค้าถูกซื้อในราคาถูก สต็อกหมด ลูกค้าจริงซื้อไม่ได้']],damage:10}),
  choices:[
   {id:'a',label:'ย้ายการคิดราคาไป Server ทันที ให้ Server อ่านราคาจากฐานข้อมูลสินค้าเท่านั้น และไม่รับราคาจาก client',q:'good',
    out:'คุณปิดช่องที่สองจนครบ ทดสอบแก้ราคาหลายวิธีแล้วระบบปฏิเสธทั้งหมด',
    u:[[-15,'ปิดร้านเพื่อแก้ไข']],trust:5,axes:{sec:2,long:2},set:{serverMoney:true},
    lesson:'ข้อมูลที่มาจากฝั่ง client ถือเป็น "คำขอ" ไม่ใช่ "ความจริง" Server ต้องคำนวณและตรวจเองทุกครั้ง',next:'wave2'},
   {id:'b',label:'เพิ่มโค้ดตรวจในเบราว์เซอร์ว่าราคาต้องตรงกับที่แสดงบนหน้า',q:'bad',
    out:'การตรวจเพิ่มดูใช้ได้บนหน้าจอปกติ แต่ผู้โจมตีไม่ได้ใช้หน้าจอของคุณ เขาส่งคำขอตรงเข้า API ข้ามการตรวจไปภายในชั่วโมงเดียว',
    u:[[-30,'ผู้โจมตีข้ามการตรวจฝั่ง client สำเร็จ']],damage:5,axes:{sec:-1,speed:1,long:-1},
    lesson:'การตรวจฝั่ง client ช่วยประสบการณ์ผู้ใช้ แต่ไม่ใช่ความปลอดภัย เพราะผู้โจมตีควบคุมฝั่ง client ได้ทั้งหมด',next:'repeat'}
  ]},

 partialRules:{
  title:'ข้อมูลลูกค้ารั่ว', tag:'โจมตีซ้ำ: Rules เปิดกว้าง', best:'a',
  bestWhy:'แก้ช่องให้ครบทันที ตรวจว่าอะไรรั่ว และแจ้งลูกค้า เพื่อให้เขาป้องกันตัวเองได้',
  text:'ห้าวันต่อมา ราคาถูกคำนวณที่ Server แล้ว แต่ Rules ที่ยังเปิดกว้างให้ผู้ล็อกอินทุกคนอ่านข้อมูลของทุกคนได้ ผู้โจมตีส่งคำสั่งตรงเข้าฐานข้อมูลแล้วดึงชื่อ ที่อยู่ และเบอร์โทรของลูกค้า 2,100 ราย ต่อมาลูกค้ากลุ่มหนึ่งเริ่มได้รับสแปม',
  enter:s=>({u:[[-120,'ลูกค้าที่ได้รับสแปมส่วนหนึ่งเลิกใช้ร้าน']],trust:-20,damage:35}),
  choices:[
   {id:'a',label:'ปิดช่องทันที แก้ Rules ให้ครบ ตรวจ log ว่าข้อมูลใดถูกอ่าน แล้วแจ้งลูกค้าที่ได้รับผลกระทบ',q:'good',
    out:'คุณแก้ Rules แล้วอีเมลแจ้งลูกค้า 2,100 ราย บอกว่าอะไรรั่ว ควรระวังอะไร ลูกค้าบางส่วนโกรธ แต่หลายคนขอบคุณที่บอกตรงๆ',
    u:[[-60,'ลูกค้าบางส่วนเลิกใช้หลังรับแจ้ง']],trust:15,axes:{sec:1,open:2,long:1},set:{rulesFixed:true,disclosed:'yes'},
    lesson:'การแจ้งผู้ได้รับผลกระทบตรงไปตรงมาเจ็บในระยะสั้น แต่ช่วยให้ผู้ใช้ป้องกันตัวเองได้และสร้างความเชื่อใจระยะยาว (กฎหมายคุ้มครองข้อมูลส่วนบุคคล เช่น PDPA ของไทย ก็มีหน้าที่เรื่องการแจ้งเหตุในบางกรณี)',next:'wave2'},
   {id:'b',label:'แก้ Rules แล้วไม่ประกาศอะไร เพราะยังไม่มีหลักฐานว่าข้อมูลถูกนำไปใช้',q:'bad',
    out:'ร้านกลับมาปกติและยังไม่มีข่าวในตอนแรก แต่ลูกค้าที่ได้รับสแปมไม่รู้ว่าข้อมูลหลุดจากที่ไหน จึงไม่ได้ป้องกันตัวเอง',
    u:[[0,'ไม่มีผลทันที']],trust:-10,axes:{open:-2,long:-1,speed:1},set:{rulesFixed:true,disclosed:'no',covered:true},
    lesson:'การเงียบไม่ได้ทำให้ปัญหาหาย มันแค่ซ่อนความเสียหายไว้ก่อนจะถูกค้นพบ และเมื่อถูกค้นพบ ความเชื่อใจจะเสียหนักกว่าเดิม',next:'news'},
   {id:'c',label:'ปิดร้านแล้วจ้างผู้เชี่ยวชาญภายนอกตรวจทั้งระบบก่อนประกาศ',q:'mid',
    out:'ผู้เชี่ยวชาญพบจุดอ่อนเพิ่มอีกสองจุดและช่วยยืนยันว่าข้อมูลใดรั่ว คุณประกาศพร้อมแผนแก้ที่ชัดเจน แต่ต้องปิดร้านนานและเสียค่าใช้จ่าย',
    u:[[-150,'ปิดร้านนาน ลูกค้าบางส่วนไม่รอ']],trust:10,axes:{sec:1,speed:-2,open:1},set:{rulesFixed:true,disclosed:'yes'},
    lesson:'ผู้เชี่ยวชาญภายนอกคุ้มค่าเมื่อไม่แน่ใจขอบเขตความเสียหาย แต่ต้องชั่งน้ำหนักกับเวลาที่ร้านต้องปิด',next:'wave2'}
  ]},

 repeat:{
  title:'โจมตีซ้ำ', tag:'ช่องเดิมถูกใช้ซ้ำ', best:'a',
  bestWhy:'เมื่อถูกโจมตีซ้ำ แปลว่าต้นเหตุยังไม่ถูกแก้ ต้องหยุด แก้ให้ครบ และสื่อสารตรงๆ',
  text:s=> s.rulesFixed
   ? 'เช้าวันถัดมา ผู้โจมตีส่งคำขอชำระเงินตรงเข้า API ข้ามการตรวจฝั่งเบราว์เซอร์ที่คุณเพิ่ม และได้สินค้าในราคาถูกอีกครั้ง'
   : (s.wrongDx
     ? 'สองวันต่อมา ผู้โจมตีกลับมา การเปลี่ยนรหัสผ่านไม่ช่วยอะไรเพราะเขาไม่เคยใช้รหัสผ่านใครเลย ครั้งนี้เขาไม่เพียงแก้ราคา แต่ยังเปิดอ่านข้อมูลลูกค้าผ่านช่องเดิมด้วย'
     : 'สองวันต่อมา ผู้โจมตีกลับมาผ่านช่องเดิมที่คุณยังไม่ได้อุด ครั้งนี้เขาไม่เพียงแก้ราคาออเดอร์ แต่ยังเปิดอ่านข้อมูลลูกค้าด้วย ร้านเสียทั้งสต็อกและความเชื่อมั่น'),
  enter:s=> s.rulesFixed
   ? {u:[[-90,'สินค้าถูกซื้อในราคาถูกอีกครั้ง ลูกค้าเสียความเชื่อมั่น']],trust:-10,damage:10}
   : {u:[[-180,'ออเดอร์ปลอมและข้อมูลลูกค้าถูกอ่าน ลูกค้าจำนวนมากเลิกใช้']],trust:-15,damage:30},
  choices:[
   {id:'a',label:'ปิดร้านชั่วคราว แก้ต้นเหตุให้ครบ (Rules + คิดราคาที่ Server) แล้วประกาศตรงๆ ว่าเกิดอะไรขึ้น',q:'good',
    out:'คุณปิดร้านชั่วคราว แก้ Rules และย้ายการคิดราคาไป Server ให้ครบ แล้วประกาศตรงๆ ว่าเกิดอะไรขึ้น ลูกค้าเสียใจแต่ส่วนใหญ่เห็นว่าคุณรับผิดชอบ',
    u:[[-90,'ปิดร้านและเสียลูกค้าบางส่วนจากข่าว']],trust:15,axes:{sec:2,open:2,long:2,speed:-1},set:{rulesFixed:true,serverMoney:true,disclosed:'yes'},
    lesson:'ถูกโจมตีซ้ำแปลว่ารอบแรกยังไม่ได้แก้ที่ต้นเหตุ ให้หยุด ทบทวนหลักฐาน แล้วแก้ให้ครบพร้อมสื่อสารอย่างตรงไปตรงมา',next:'wave2'},
   {id:'b',label:'แก้ทางเทคนิคให้ครบ แต่ไม่บอกใคร ไม่อยากให้ลูกค้าตกใจ',q:'bad',
    out:'ระบบปลอดภัยขึ้นจริง และร้านดูเงียบ แต่ลูกค้าที่ข้อมูลหลุดไม่รู้ตัวและไม่ได้ป้องกันตัวเอง',
    u:[[0,'ไม่มีผลทันที']],trust:-10,axes:{open:-2,long:-1,sec:1},set:{rulesFixed:true,serverMoney:true,disclosed:'no',covered:true},
    lesson:'การซ่อนเหตุไม่ได้ปกป้องลูกค้า มันแค่เลื่อนวันที่ความจริงถูกเปิดเผย',next:'news'},
   {id:'c',label:'ลดราคาและแจกคูปองดึงลูกค้ากลับ ไว้ค่อยแก้ระบบทีหลัง',q:'bad',
    out:'ยอดสั่งซื้อพุ่งทันที แต่ผู้โจมตีก็เห็นว่าช่องยังเปิดอยู่ และเริ่มใช้ซ้ำทุกวันพร้อมๆ กับลูกค้าจริง',
    u:[[60,'คูปองดึงลูกค้าบางส่วนกลับมา']],trust:-10,axes:{sec:-2,speed:2,long:-2},
    lesson:'แก้ที่ภาพลักษณ์โดยไม่แก้ที่ระบบคือการเลื่อนปัญหา มันกลับมาแรงกว่าเดิม',next:'END:bleeding'}
  ]},

 rewrite:{
  title:'ร้านใหม่ ช่องใหม่', tag:'ช่องโหว่ใหม่จากการเร่งทำ', best:'a',
  bestWhy:'ปิดช่องแอดมินก่อนเปิดตัวจริง หลายชั้น (จำกัดการลองรหัส + ด่านที่สอง) ปลอดภัยกว่ารอให้เกิดเหตุ',
  text:'สองสัปดาห์ต่อมา ร้านใหม่เปิดตัว ระบบคิดราคาที่ Server แล้ว และ Rules รัดกุมกว่าเดิมมาก ลูกค้าบางส่วนกลับมาตามข่าวเปิดตัว แต่ตอนเร่งทำ คุณลืมเปลี่ยนรหัสผ่านเริ่มต้นของหน้าแอดมิน และไม่ได้จำกัดจำนวนครั้งที่ล็อกอินผิด ตอนนี้มีบอทลองรหัสผ่านหน้าแอดมินราว 3,000 ครั้งต่อชั่วโมง',
  enter:s=>({u:[[120,'ลูกค้าบางส่วนกลับมาตามข่าวเปิดตัว']],trust:10,set:{rulesFixed:true,serverMoney:true}}),
  choices:[
   {id:'a',label:'เปลี่ยนรหัสเริ่มต้น เปิดการยืนยันตัวตนสองขั้นตอน (2-step) ให้แอดมิน และจำกัดจำนวนครั้งที่ล็อกอินผิด',q:'good',
    out:'บอทยังพยายามอยู่ แต่ถูกบล็อกหลังพยายามผิดไม่กี่ครั้ง และต่อให้เดารหัสถูกก็เข้าไม่ได้หากไม่มีรหัสจากโทรศัพท์ของคุณ',
    u:[[20,'ลูกค้ามั่นใจเมื่อร้านนิ่ง']],axes:{sec:2,long:2},set:{mfa:true},
    lesson:'ป้องกันหลายชั้น (defence in depth): จำกัดการลองรหัส + ด่านที่สอง ทำให้รหัสผ่านที่อ่อนหรือหลุดไม่ใช่จุดล้มเหลวจุดเดียว',next:'wave2_blocked'},
   {id:'b',label:'เปลี่ยนเฉพาะรหัสเริ่มต้นเป็นรหัสที่ยาวขึ้น',q:'mid',
    out:'รหัสยาวช่วยได้มาก แต่บอทยังลองได้ไม่จำกัด และยังไม่มีด่านที่สองถ้ารหัสถูกหลอกขอไป',
    u:[[0,'ไม่มีผลทันที']],axes:{sec:1,speed:1,long:-1},
    lesson:'รหัสผ่านที่แข็งแรงเป็นด่านแรกที่ดี แต่ไม่ควรเป็นด่านเดียว',next:'wave2'},
   {id:'c',label:'ยังไม่ทำตอนนี้ เพราะยังไม่มีใครเข้าได้ และต้องรีบโปรโมตร้านก่อน',q:'bad',
    out:'ยอดสั่งซื้อวันแรกดีมาก แต่คืนนั้นบอทเดารหัสแอดมินสำเร็จ',
    u:[[60,'แคมเปญโปรโมตได้ผล']],axes:{sec:-2,long:-2,speed:1},set:{adminWeak:true},
    lesson:'ความเสี่ยงที่ยังไม่เกิดไม่ใช่ความเสี่ยงที่ไม่มี บอทที่ลองรหัสอยู่แล้วคือหลักฐานชัดว่าร้านกำลังถูกเล็ง',next:'takeover'}
  ]},

 wave2:{
  title:'อีเมลฟิชชิ่ง', tag:'ฟิชชิ่ง', best:'a',
  bestWhy:'ตรวจจากช่องทางที่คุณเข้าเอง ไม่ใช่ลิงก์ในอีเมล และเพิ่มด่านที่สองให้บัญชีสำคัญ',
  text:'ผ่านไปราวหนึ่งสัปดาห์ ช่องโหว่ที่เคยถูกใช้ถูกอุดแล้ว แต่ผู้โจมตีเปลี่ยนวิธี คุณได้รับอีเมลที่อ้างว่ามาจากผู้ให้บริการโฮสติ้ง แจ้งว่าบัญชีของคุณจะถูกระงับใน 24 ชั่วโมงหากไม่กดลิงก์ยืนยัน โลโก้และสำนวนดูเหมือนจริงมาก',
  choices:[
   {id:'a',label:'ไม่กดลิงก์ เปิดเว็บผู้ให้บริการด้วยการพิมพ์ที่อยู่เอง ตรวจว่ามีแจ้งเตือนจริงไหม และเปิด 2-step ให้ทุกบัญชีแอดมิน',q:'good',
    out:'ไม่มีแจ้งเตือนใดๆ ในบัญชีจริง คุณรู้ว่าเป็นฟิชชิ่ง จึงเปิด 2-step ให้ทุกบัญชีแอดมินเสริม และบอกทีมไม่ให้กดลิงก์ในอีเมลแบบนี้',
    u:[[40,'ร้านนิ่ง ลูกค้ากลับมาใช้']],trust:5,axes:{sec:2,long:2,speed:-1},set:{mfa:true},
    lesson:'อีเมลที่เร่งให้รีบทำ + ลิงก์ คือสัญญาณฟิชชิ่งคลาสสิก ให้ตรวจจากช่องทางที่คุณเข้าเอง และ 2-step ช่วยได้แม้รหัสผ่านหลุด',next:'END'},
   {id:'b',label:'กดลิงก์ ถ้าหน้าตาเหมือนจริงก็กรอกรหัส เพราะกลัวบัญชีโดนระงับ',q:'bad',
    out:'หน้าที่เห็นเป็นหน้าปลอมที่เก็บรหัสผ่านของคุณ ไม่กี่ชั่วโมงต่อมามีคนล็อกอินเข้าบัญชีโฮสติ้งและหลังร้านของคุณด้วยรหัสเดียวกัน',
    u:[[0,'ยังไม่เห็นผลทันที']],axes:{sec:-2,speed:2},
    lesson:'ความเร่งด่วนเป็นเครื่องมือของฟิชชิ่ง และการใช้รหัสผ่านเดียวกันหลายที่ทำให้หลุดทีเดียวพังทั้งชุด',next:'takeover'},
   {id:'c',label:'ลบอีเมลทิ้ง ไม่ต้องทำอะไรเพิ่ม',q:'mid',
    out:'คุณรอดครั้งนี้ แต่ไม่ได้ตรวจบัญชีหรือเพิ่มด่านที่สอง ถ้ามีอีเมลที่แนบเนียนกว่านี้มาอีก ก็ไม่มีอะไรช่วย',
    u:[[10,'ไม่มีเหตุเพิ่ม']],axes:{speed:1,long:-1},
    lesson:'การไม่โดนหลอกครั้งนี้ไม่ได้แปลว่าปลอดภัย ควรเสริมด่านที่สอง (2-step) เพื่อให้รหัสผ่านหลุดแล้วไม่พังทั้งระบบ',next:'END'}
  ]},

 takeover:{
  title:'บัญชีแอดมินถูกยึด', tag:'ยึดบัญชี', best:'a',
  bestWhy:'ต้องตัดผู้โจมตีออกจากทุกทาง (เซสชัน/โทเค็น) ไม่ใช่แค่เปลี่ยนรหัสผ่าน แล้วตรวจย้อนหลังว่าเขาแก้อะไร',
  text:'ผู้โจมตีเข้าหลังร้านด้วยบัญชีแอดมินจริง เขาแก้ราคาสินค้า เปลี่ยนบัญชีรับเงินเป็นของตัวเอง และเปิดดูข้อมูลลูกค้า โดยไม่ต้องใช้ช่องโหว่ในโค้ดเลย',
  enter:s=>({u:[[-250,'ราคาและบัญชีรับเงินถูกแก้ ลูกค้าจำนวนมากหายไป']],trust:-20,damage:40}),
  choices:[
   {id:'a',label:'เพิกถอนทุกเซสชัน เปลี่ยนรหัสทุกบัญชี เปิด 2-step ตรวจ log ว่าอะไรถูกแก้ ย้อนค่าที่ถูกเปลี่ยน และแจ้งลูกค้า',q:'good',
    out:'คุณไล่ย้อนการเปลี่ยนแปลงทีละรายการ คืนบัญชีรับเงินเดิม ปิดทางเข้าเดิมครบ ลูกค้าได้รับแจ้งตรงๆ',
    u:[[-80,'ปิดร้านแก้ไข และลูกค้าบางส่วนเลิกใช้หลังรับแจ้ง']],trust:15,damage:-10,axes:{sec:2,open:2,long:2},set:{mfa:true,disclosed:'yes'},
    lesson:'เมื่อบัญชีถูกยึด ต้องตัดผู้โจมตีออกจากทุกทาง (เซสชัน โทเค็น คีย์) ไม่ใช่แค่เปลี่ยนรหัสผ่าน แล้วตรวจย้อนหลังว่าเขาแก้อะไรไปบ้าง',next:'END'},
   {id:'b',label:'เปลี่ยนรหัสผ่านอย่างเดียวแล้วเปิดร้านต่อ',q:'bad',
    out:'ผู้โจมตียังถือเซสชันเก่าที่ยังไม่หมดอายุ เขากลับเข้ามาอีกคืนหนึ่งและแก้บัญชีรับเงินอีกครั้ง',
    u:[[-40,'ปิดร้านสั้นๆ เพื่อเปลี่ยนรหัสผ่าน'],[-150,'ผู้โจมตีกลับเข้ามาทางเซสชันเดิม']],trust:-10,damage:15,axes:{sec:-1,speed:1,long:-1},
    lesson:'เปลี่ยนรหัสผ่านอย่างเดียวไม่พอเมื่อผู้โจมตีมีเซสชันหรือโทเค็นอยู่แล้ว ต้องเพิกถอนให้หมด',next:'END'},
   {id:'c',label:'จ้างทีมผู้เชี่ยวชาญภายนอกตรวจหลังบ้านทั้งระบบ แล้วทำตามคำแนะนำ',q:'mid',
    out:'ทีมตรวจพบว่าผู้โจมตีฝังบัญชีแอดมินลับไว้ ช่วยลบออกและตั้งค่า 2-step ให้ ลูกค้าได้รับแจ้ง ต้นทุนสูงแต่ปลอดภัย',
    u:[[-150,'ปิดร้านนานและเสียค่าตรวจ ลูกค้าบางส่วนไม่รอ']],trust:10,damage:-10,axes:{sec:1,speed:-2,long:1},set:{mfa:true,disclosed:'yes'},
    lesson:'ผู้โจมตีมักทิ้ง "ประตูหลัง" ไว้ การตรวจโดยผู้ชำนาญช่วยหาสิ่งที่เรามองไม่เห็น แต่ต้องแลกกับเวลาและเงิน',next:'END'}
  ]},

 news:{
  title:'ข่าวหลุด', tag:'ผลของการปิดบัง', best:'a',
  bestWhy:'ถ้าพลาดเรื่องการแจ้ง ให้ยอมรับและแก้ทันทีที่รู้ตัว ยิ่งเงียบนาน ราคาของความเชื่อใจยิ่งแพง',
  text:'ลูกค้าคนหนึ่งโพสต์ว่าเขาได้รับสแปมที่อ้างชื่อและที่อยู่ที่ใช้สั่งของจากร้านคุณ โพสต์ถูกแชร์หลายพันครั้งภายในคืนเดียว และคนเริ่มถามว่าร้านรู้เรื่องนี้ไหม',
  enter:s=>({u:[[-200,'ข่าวหลุดว่าร้านเคยปิดบังเหตุ']],trust:-30,damage:20}),
  choices:[
   {id:'a',label:'ออกแถลงการณ์ยอมรับ บอกว่าอะไรรั่ว แก้อะไรแล้ว และแนะนำลูกค้าให้ระวังสแปมและเปลี่ยนรหัสผ่าน',q:'good',
    out:'คุณยอมรับว่ารู้เรื่องมาก่อนแล้วไม่ได้แจ้ง ถูกวิจารณ์หนัก แต่ข้อมูลที่ชัดเจนทำให้ลูกค้าส่วนหนึ่งยังอยู่',
    u:[[-100,'ลูกค้าบางส่วนเลิกใช้หลังรู้ว่าถูกปิดบัง']],trust:20,axes:{open:2,long:1},set:{disclosed:'yes'},
    lesson:'ถ้าพลาดเรื่องการแจ้ง ให้แก้ทันทีที่รู้ตัว ความโปร่งใสที่มาช้ายังดีกว่าไม่มาเลย',next:'wave2'},
   {id:'b',label:'ปฏิเสธว่าไม่เกี่ยวข้องกับร้านเรา',q:'bad',
    out:'ผู้ใช้ไล่เทียบข้อมูลแล้วพบว่าตรงกับร้านคุณ การปฏิเสธถูกแชร์ต่อเป็นตัวอย่างของร้านที่ไม่รับผิดชอบ',
    u:[[-350,'ถูกจับได้ว่าปฏิเสธข้อเท็จจริง']],trust:-30,axes:{open:-2,long:-2},
    lesson:'การปฏิเสธข้อเท็จจริงที่ตรวจสอบได้ทำให้ความเสียหายกลายเป็นวิกฤตความน่าเชื่อถือ',next:'END'},
   {id:'c',label:'ปิดร้านตรวจสอบสามวันก่อนออกแถลงการณ์',q:'mid',
    out:'คุณหยุดรับออเดอร์เพื่อยืนยันขอบเขตความเสียหาย แล้วประกาศพร้อมรายละเอียด แต่ช่วงสามวันนั้นข่าวลือแพร่ไปไกลกว่า',
    u:[[-150,'เงียบสามวัน ข่าวลือแพร่']],trust:5,axes:{open:1,speed:-2,sec:1},set:{disclosed:'yes'},
    lesson:'ตรวจให้แน่ใจก่อนพูดเป็นเรื่องดี แต่ถ้าเงียบนานเกินไป ข่าวลือจะเล่าเรื่องแทนคุณ',next:'wave2'}
  ]},

 wave2_blocked:{
  title:'ฟิชชิ่งที่ไม่ได้ผล', tag:'ฟิชชิ่ง (ถูกสกัด)', best:'a',
  bestWhy:'—',
  text:'สัปดาห์ต่อมา อีเมลฟิชชิ่งที่ปลอมเป็นผู้ให้บริการโฮสติ้งมาถึงทีมคุณ มีแอดมินหนึ่งคนกรอกรหัสผ่านลงหน้าปลอมไปแล้ว แต่ผู้โจมตีเข้าบัญชีไม่ได้ เพราะบัญชีแอดมินทุกบัญชีมี 2-step และคุณได้รับแจ้งเตือนว่ามีการล็อกอินจากอุปกรณ์แปลก',
  enter:s=>({u:[[30,'ลูกค้าเห็นร้านนิ่ง ไม่มีเหตุ']],trust:5}),
  choices:[
   {id:'a',label:'ดูบทสรุป',q:'good',
    out:'คุณเปลี่ยนรหัสของแอดมินคนนั้นและเตือนทีมอีกครั้ง ไม่มีความเสียหายเกิดขึ้น',
    u:[[0,'ไม่มีความเสียหาย']],axes:{},
    lesson:'ด่านที่สองทำให้ความผิดพลาดของคนเดียวไม่กลายเป็นหายนะของทั้งร้าน',next:'END'}
  ]}
};

const ENDINGS={
 root:{title:'ผู้สร้างร้านที่ไว้ใจได้',tone:'good',desc:'คุณแก้ถึงต้นเหตุ ปิดด่านหลายชั้น และร้านยังมีผู้ใช้เกือบเท่าเดิม ลูกค้าเห็นร้านที่รับมือเหตุได้อย่างเป็นระบบ'},
 rebuilder:{title:'สถาปนิกผู้สร้างใหม่',tone:'good',desc:'คุณเลือกเส้นทางที่แพงที่สุด คือเขียนใหม่ทั้งหมด แล้วอุดช่องใหม่ที่เกิดจากการเร่งทำได้ทัน ร้านปลอดภัย แต่ผู้ใช้ไม่เหมือนเดิม'},
 honest:{title:'ซื่อสัตย์แต่บอบช้ำ',tone:'mid',desc:'ร้านเจ็บหนัก แต่คุณบอกความจริงกับลูกค้า ความเชื่อใจที่เหลืออยู่คือฐานให้ร้านกลับมาได้'},
 survivor:{title:'ผู้รอดที่เรียนรู้',tone:'mid',desc:'ร้านยังเปิดอยู่และปิดช่องสำคัญได้แล้ว แม้ระหว่างทางจะมีผลที่ต้องแลกมา'},
 nomfa:{title:'แก้เก่ง แต่ลืมด่านสอง',tone:'mid',desc:'ช่องโหว่ในโค้ดถูกอุดแล้ว แต่บัญชีแอดมินยังพึ่งรหัสผ่านอย่างเดียว ความเสี่ยงที่เหลืออยู่คือเรื่องของคน ไม่ใช่โค้ด'},
 cover:{title:'ปิดบังจนเสียความเชื่อใจ',tone:'bad',desc:'ระบบอาจถูกแก้แล้ว แต่การไม่บอกลูกค้าทำให้ความเสียหายถูกเลื่อนไปเกิดทีหลังและแรงกว่าเดิม'},
 scarred:{title:'แผลลึกแต่ยังยืน',tone:'bad',desc:'ข้อมูลและทรัพย์สินของร้านเสียหายหนัก ร้านยังรอดอยู่ แต่ต้องใช้เวลานานกว่าลูกค้าจะกลับมาไว้ใจ'},
 bleeding:{title:'เลือดไหลไม่หยุด',tone:'bad',desc:'คุณเลือกดึงลูกค้าด้วยโปรโมชันโดยไม่แก้ระบบ ผู้โจมตีใช้ช่องเดิมทุกวัน ร้านค่อยๆ ล่มโดยไม่มีวันจบเหตุ'},
 collapse:{title:'ร้านต้องปิดตัว',tone:'bad',desc:'จำนวนผู้ใช้ต่ำเกินกว่าร้านจะอยู่ต่อได้ ลองย้อนดูว่าการตัดสินใจครั้งไหนทำให้ผู้ใช้หายมากที่สุด'}
};

const AXES=[
 {k:'sec',L:'ความต่อเนื่องของธุรกิจ',R:'ความปลอดภัย',letL:'B',letR:'S',
  dL:'คุณมักรักษาให้ร้านเปิดต่อก่อน แม้ความเสี่ยงยังไม่หมด',dR:'คุณยอมเสียรายได้ระยะสั้นเพื่อให้ระบบปลอดภัยก่อน',dM:'คุณชั่งน้ำหนักระหว่างความปลอดภัยกับการเปิดร้านได้ค่อนข้างสมดุล'},
 {k:'speed',L:'รอบคอบ',R:'ลงมือเร็ว',letL:'C',letR:'F',
  dL:'คุณชอบตรวจให้แน่ใจก่อนลงมือ ข้อดีคือแม่น ข้อระวังคือช้า',dR:'คุณตัดสินใจไว ข้อดีคือหยุดเหตุเร็ว ข้อระวังคือแก้ไม่ครบ',dM:'คุณปรับจังหวะเร็ว/ช้าตามสถานการณ์ได้ดี'},
 {k:'open',L:'รักษาภาพลักษณ์',R:'โปร่งใส',letL:'I',letR:'T',
  dL:'คุณมักกังวลเรื่องภาพลักษณ์ ซึ่งมักทำให้ลูกค้าเสียความเชื่อใจทีหลัง',dR:'คุณบอกความจริงกับผู้ใช้ แม้เจ็บในระยะสั้น',dM:'คุณยังไม่ได้เจอจังหวะที่ต้องเลือกเรื่องการสื่อสารมากนัก'},
 {k:'long',L:'แก้เฉพาะหน้า',R:'มองระยะยาว',letL:'N',letR:'L',
  dL:'คุณมักเลือกทางที่ได้ผลเร็ว ซึ่งบางครั้งทิ้งต้นเหตุไว้',dR:'คุณมองถึงต้นเหตุและผลระยะยาว',dM:'คุณผสมการแก้เฉพาะหน้ากับการแก้ที่ต้นเหตุ'}
];

/* ============================================================
   ENGINE — ไม่แตะ DOM ทดสอบได้แยก
   ============================================================ */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function newState(){
  return {users:START_USERS,trust:50,damage:0,rulesFixed:false,serverMoney:false,mfa:false,
    disclosed:'none',covered:false,rewrote:false,wrongDx:false,adminWeak:false,
    axes:{sec:0,speed:0,open:0,long:0},history:[],series:[START_USERS],
    nodeId:null,enterFx:null,enterTotal:0,dead:false,forcedEnding:null,lastNext:null};
}
function applyFx(S,fx){
  let total=0;(fx.u||[]).forEach(p=>{total+=p[0];});
  S.users=Math.max(0,S.users+total);
  S.trust=clamp(S.trust+(fx.trust||0),0,100);
  S.damage=clamp(S.damage+(fx.damage||0),0,100);
  if(fx.set)Object.assign(S,fx.set);
  if(fx.axes)for(const k in fx.axes)S.axes[k]+=fx.axes[k];
  return total;
}
function enterNode(S,id){
  const n=NODES[id];S.nodeId=id;
  const fx=n.enter?n.enter(S):null;
  S.enterFx=fx;S.enterTotal=fx?applyFx(S,fx):0;
  S.series.push(S.users);S.dead=S.users<DEAD;
  return n;
}
function pick(S,cid){
  const n=NODES[S.nodeId];const c=n.choices.find(x=>x.id===cid);
  const total=applyFx(S,c);
  const rec={nodeId:S.nodeId,choiceId:cid,label:c.label,q:c.q,enterTotal:S.enterTotal,total,after:S.users};
  S.history.push(rec);S.series.push(S.users);
  if(S.users<DEAD)S.dead=true;
  S.lastNext=c.next;
  return {choice:c,rec};
}
function nextOf(S){
  if(S.dead){S.forcedEnding='collapse';return 'END';}
  const nx=S.lastNext;
  if(nx.indexOf('END')===0){const p=nx.split(':');if(p[1])S.forcedEnding=p[1];return 'END';}
  return nx;
}
function endingOf(S){
  if(S.forcedEnding)return S.forcedEnding;
  const fixed=S.rulesFixed&&S.serverMoney;
  if(fixed&&S.mfa&&S.damage<=10&&S.users>=900&&!S.covered)return 'root';
  if(S.rewrote&&fixed&&S.mfa&&S.damage<30&&!S.covered)return 'rebuilder';
  if(S.covered)return 'cover';
  if(S.disclosed==='yes'&&S.damage>=30)return 'honest';
  if(S.damage>=40)return 'scarred';
  if(!S.mfa||!fixed)return 'nomfa';
  return 'survivor';
}
function scoreOf(S,endId){
  const parts=[
   {l:'ผู้ใช้ที่เหลือ',v:clamp((S.users-DEAD)/(START_USERS-DEAD),0,1)*40,max:40},
   {l:'แก้ต้นเหตุ (Rules + คิดราคาที่ Server)',v:(S.rulesFixed?10:0)+(S.serverMoney?10:0),max:20},
   {l:'ด่านที่สอง (2-step)',v:S.mfa?10:0,max:10},
   {l:'ความเชื่อใจของลูกค้า',v:clamp(S.trust,0,100)/100*15,max:15},
   {l:'ความเสียหายที่ตามมา (ยิ่งน้อยยิ่งดี)',v:(1-clamp(S.damage,0,100)/100)*15,max:15}
  ];
  let t=parts.reduce((a,p)=>a+p.v,0);
  if(S.covered)t-=10;
  if(endId==='collapse')t=Math.min(t,30);
  if(endId==='bleeding')t=Math.min(t,35);
  return {total:Math.round(clamp(t,0,100)),parts,penalty:S.covered?10:0};
}
function gradeOf(n){return n>=90?'ยอดเยี่ยม':n>=75?'ดีมาก':n>=60?'ผ่าน':n>=40?'ต้องปรับปรุง':'เสี่ยงมาก';}
function choiceTotal(){let n=0;for(const k in NODES)n+=NODES[k].choices.length;return n;}

/*__UI__*/
/* ============================================================
   UI
   ============================================================ */
const $=s=>document.querySelector(s);
const app=$('#app');
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const sgn=d=>d>0?'+'+fmtN(d):d<0?'\u2212'+fmtN(Math.abs(d)):'\u00B10';
let S=null;
const UI={screen:'start',phase:'choose',from:START_USERS,last:null,armed:false};
const KIOSK=(function(){try{return new URLSearchParams(location.search).get('kiosk')==='1';}catch(e){return false;}})();

/* storage: เก็บตอนจบ/ตัวเลือกที่เคยเจอ (ในเบราว์เซอร์นี้เท่านั้น) */
const KEY='ld.shop.v1';
function loadStore(){try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);return {endings:o.endings||[],choices:o.choices||[]};}}catch(e){}return {endings:[],choices:[]};}
function saveStore(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
let STORE=loadStore();
function remember(kind,val){if(STORE[kind].indexOf(val)<0){STORE[kind].push(val);saveStore(STORE);}}

function chips(list){
  if(!list||!list.length)return '';
  return '<ul class="chips">'+list.map(p=>`<li class="chip ${p[0]>0?'pos':p[0]<0?'neg':'zero'}"><b>${sgn(p[0])}</b><span>${p[1]}</span></li>`).join('')+'</ul>';
}
function meterHTML(){
  const u=S.users;const cls=u<400?'bar risk':'bar';
  const state=u<300?'อันตราย: ใกล้ถึงจุดที่ร้านอยู่ต่อไม่ได้':u<500?'ร้านเริ่มสั่นคลอน':u>=START_USERS?'ฐานผู้ใช้แข็งแรง':'ฐานผู้ใช้ลดลง แต่ร้านยังไปต่อได้';
  return `<section class="meter" aria-label="จำนวนผู้ใช้">
    <div class="meter-top"><span class="lbl">ผู้ใช้ร้านค้า</span><span class="num" id="usersNum">${fmtN(UI.from)}</span></div>
    <div class="${cls}"><div class="fill" id="usersFill" style="width:${Math.min(100,UI.from/MAXU*100)}%"></div>
      <div class="mark" style="left:${DEAD/MAXU*100}%"><span>${DEAD}</span></div></div>
    <div class="state">${state} (ต่ำกว่า ${DEAD} คน ร้านต้องปิด)</div></section>`;
}
function animateMeter(){
  const num=document.getElementById('usersNum'),fill=document.getElementById('usersFill');
  if(!num)return;
  const from=UI.from,to=S.users;
  const w=v=>Math.min(100,v/MAXU*100)+'%';
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||from===to){num.textContent=fmtN(to);fill.style.width=w(to);return;}
  requestAnimationFrame(()=>{fill.style.width=w(to);});
  const t0=performance.now(),dur=900;
  (function step(t){const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,3);num.textContent=fmtN(from+(to-from)*e);if(p<1)requestAnimationFrame(step);})(t0);
}
function topBar(){
  const n=S?S.history.length+(UI.phase==='choose'?1:0):0;
  return `<div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span>
   <span class="step">${S?'การตัดสินใจที่ '+Math.max(1,n):''}</span>
   <button class="ghost" id="btnRestart">${UI.armed?'กดอีกครั้งเพื่อเริ่มใหม่':'เริ่มใหม่'}</button></div>`;
}
function bindTop(){
  const b=$('#btnRestart');if(!b)return;
  b.onclick=()=>{
    if(!UI.armed){UI.armed=true;b.textContent='กดอีกครั้งเพื่อเริ่มใหม่';setTimeout(()=>{UI.armed=false;if(b.isConnected)b.textContent='เริ่มใหม่';},3000);return;}
    UI.armed=false;toStart();
  };
}
function go(){window.scrollTo(0,0);const f=app.querySelector('[data-focus]');if(f)f.focus({preventScroll:true});resetIdle();}

/* ---------- screens ---------- */
function toStart(){S=null;UI.screen='start';UI.phase='choose';render();}
function begin(){
  S=newState();UI.screen='play';UI.phase='choose';UI.from=S.users;UI.last=null;
  enterNode(S,'start');render();
}
function render(){
  if(UI.screen==='start')renderStart();
  else if(UI.screen==='play')renderPlay();
  else renderResult();
  go();
}
function renderStart(){
  STORE=loadStore();
  const got=STORE.endings.length,tot=Object.keys(ENDINGS).length;
  app.innerHTML=`
  <div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step">โจทย์ที่ 1</span></div>
  <header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">สร้างให้ฉลาด เลือกให้คิด ปกป้องระบบของคุณ</p>
  </header>
  <section class="card scn">
    <span class="tag">โจทย์วันนี้</span>
    <h2>ร้านค้าออนไลน์ที่คุณเขียนเอง</h2>
    <p>คุณสร้างร้านขายของออนไลน์ด้วยตัวเอง วันหนึ่งมีบางอย่างผิดปกติ คุณต้องตัดสินใจทีละขั้น ดูว่าผู้ใช้ขึ้นหรือลง และเรียนรู้ว่าแต่ละทางส่งผลอะไรตามมา</p>
    <ul class="rules">
      <li>ทุกตัวเลือกมีข้อดีข้อเสีย ไม่มีข้อไหนฟรี</li>
      <li>เรื่องแตกกิ่งตามที่คุณเลือก จำนวนรอบไม่เท่ากัน ถ้าแก้ถูกจุดจะจบเร็ว</li>
      <li>ถ้าผู้ใช้เหลือต่ำกว่า ${DEAD} คน ร้านต้องปิด</li>
    </ul>
  </section>
  <button class="primary" id="btnStart">เริ่มเล่น</button>
  <p class="foot">ใช้เวลาราว 3 ถึง 6 นาที ไม่ต้องล็อกอิน${got?` · ตอนจบที่เจอแล้ว ${got}/${tot}`:''}</p>
  <p class="foot">เป็นเกมจำลองเพื่อการเรียนรู้ ตัวเลขผู้ใช้และคะแนนไม่ใช่สถิติจริง</p>`;
  $('#btnStart').onclick=begin;
}
function renderPlay(){
  const n=NODES[S.nodeId];
  if(UI.phase==='choose')renderChoose(n);else renderConsequence(n);
  bindTop();animateMeter();
  $('#live').textContent='ผู้ใช้ '+fmtN(S.users)+' คน';
}
function renderChoose(n){
  const text=typeof n.text==='function'?n.text(S):n.text;
  const ev=S.enterFx?`<div class="sub">ผลจากเหตุการณ์นี้</div>${chips(S.enterFx.u)}`:'';
  let body;
  if(S.dead){
    body=`<p class="chosen"><b>ผู้ใช้เหลือน้อยกว่า ${DEAD} คน</b> ร้านอยู่ต่อไม่ได้แล้ว</p>
      <button class="primary" id="btnEnd">ดูบทสรุป</button>`;
  }else{
    body=`<div class="choices" role="group" aria-label="ตัวเลือก">`+n.choices.map((c,i)=>
      `<button class="choice" data-id="${c.id}"><span class="key">${String.fromCharCode(65+i)}</span><span class="ct">${c.label}</span></button>`).join('')+`</div>`;
  }
  app.innerHTML=topBar()+meterHTML()+`
   <section class="card"><span class="tag">${n.tag}</span><h2 data-focus tabindex="-1">${n.title}</h2>
    <p>${text}</p>${ev}</section>`+body;
  if(S.dead){$('#btnEnd').onclick=finish;}
  else app.querySelectorAll('.choice').forEach(b=>{b.onclick=()=>choose(b.dataset.id);});
}
function choose(cid){
  if(UI.phase!=='choose'||S.dead)return;
  UI.phase='busy';
  app.querySelectorAll('.choice').forEach(b=>b.disabled=true);
  UI.from=S.users;
  UI.last=pick(S,cid);
  remember('choices',S.nodeId+':'+cid);
  UI.phase='result';render();
}
function renderConsequence(n){
  const {choice}=UI.last;
  const qt={good:['good','\u2713 ทางที่ดี'],mid:['mid','~ พอใช้ มีข้อแลกเปลี่ยน'],bad:['bad','! ควรปรับ']}[choice.q];
  const btn=S.dead?'ดูบทสรุป':'ไปต่อ';
  app.innerHTML=topBar()+meterHTML()+`
   <section class="card">
    <p class="chosen">คุณเลือก: <b>${choice.label}</b></p>
    <span class="quality ${qt[0]}">${qt[1]}</span>
    <h2 data-focus tabindex="-1">สิ่งที่เกิดขึ้น</h2>
    <p>${choice.out}</p>
    <div class="sub">ผลต่อจำนวนผู้ใช้</div>${chips(choice.u)}
    <div class="know"><strong>ความรู้ Cybersecurity</strong>${choice.lesson}</div>
   </section>
   <button class="primary" id="btnNext">${btn}</button>`;
  $('#btnNext').onclick=advance;
}
function advance(){
  const nx=nextOf(S);
  if(nx==='END'){finish();return;}
  UI.phase='choose';UI.from=S.users;enterNode(S,nx);render();
}
function finish(){
  if(!S.forcedEnding&&S.dead)S.forcedEnding='collapse';
  S.endId=endingOf(S);remember('endings',S.endId);
  STORE=loadStore();
  UI.screen='result';render();
}

/* ---------- result ---------- */
function chartSVG(){
  const W=640,H=180,pl=34,pr=12,pt=12,pb=26;
  const pts=S.series,n=pts.length;
  const x=i=>pl+(n===1?0:i/(n-1))*(W-pl-pr);
  const y=v=>pt+(1-clamp(v,0,MAXU)/MAXU)*(H-pt-pb);
  const line=pts.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
  const dots=pts.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="var(--cyan)"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟจำนวนผู้ใช้ตลอดเรื่อง: ${pts.map(fmtN).join(', ')}">
   <line x1="${pl}" x2="${W-pr}" y1="${y(DEAD)}" y2="${y(DEAD)}" stroke="var(--pink)" stroke-dasharray="5 4"/>
   <text x="${pl+4}" y="${y(DEAD)-4}">จุดปิดร้าน ${DEAD}</text>
   <line x1="${pl}" x2="${W-pr}" y1="${y(START_USERS)}" y2="${y(START_USERS)}" stroke="var(--line)" stroke-dasharray="2 4"/>
   <text x="${pl+4}" y="${y(START_USERS)-4}">เริ่มต้น ${fmtN(START_USERS)}</text>
   <path d="${line}" fill="none" stroke="var(--purple)" stroke-width="3" stroke-linejoin="round"/>${dots}
   <text x="${pl}" y="${H-6}">เริ่ม</text><text x="${W-pr-24}" y="${H-6}">จบ</text></svg>`;
}
function axesHTML(){
  let code='';
  const rows=AXES.map(a=>{
    const v=S.axes[a.k];code+=v>=0?a.letR:a.letL;
    const pct=clamp(50+clamp(v,-6,6)/6*50,4,96);
    const d=v>=2?a.dR:v<=-2?a.dL:a.dM;
    return `<div class="axis"><div class="axl"><span>${a.L}</span><span>${a.R}</span></div>
      <div class="axbar" role="img" aria-label="${a.L} ถึง ${a.R}: ${v}"><i style="left:${pct}%"></i></div><p>${d}</p></div>`;
  }).join('');
  return {rows,code};
}
function reviewHTML(){
  return S.history.map(h=>{
    const n=NODES[h.nodeId];const c=n.choices.find(x=>x.id===h.choiceId);
    const qt={good:['good','\u2713 ทางที่ดี'],mid:['mid','~ พอใช้'],bad:['bad','! ควรปรับ']}[h.q];
    const best=n.choices.find(x=>x.id===n.best);
    const better=(h.q!=='good'&&best&&n.bestWhy!=='—')?`<div class="better"><b>ทางที่ดีกว่า:</b> ${best.label}<br>${n.bestWhy}</div>`:'';
    const ev=h.enterTotal?`เหตุการณ์ ${sgn(h.enterTotal)} · `:'';
    return `<div class="rev"><span class="quality ${qt[0]}">${qt[1]}</span><h3>${n.title}</h3>
      <div class="ch">คุณเลือก: ${c.label}</div>
      <div class="tot">${ev}การตัดสินใจ ${sgn(h.total)} ผู้ใช้</div>
      <div class="know"><strong>ความรู้</strong>${c.lesson}</div>${better}</div>`;
  }).join('');
}
function summaryLists(){
  const pros=[],cons=[],recs=[];
  const fixed=S.rulesFixed&&S.serverMoney;
  if(fixed)pros.push('แก้ถึงต้นเหตุทั้งสองจุด (Rules และการคิดราคาที่ Server) ช่องที่ใช้โจมตีครั้งแรกถูกปิดจริง');
  if(S.mfa)pros.push('มีด่านที่สอง (2-step) ที่ลดผลจากรหัสผ่านที่หลุดหรือถูกหลอกขอ');
  if(S.disclosed==='yes')pros.push('สื่อสารกับลูกค้าตรงไปตรงมา ช่วยให้ลูกค้าป้องกันตัวเองและรักษาความเชื่อใจระยะยาว');
  if(S.history[0]&&S.history[0].choiceId==='a')pros.push('กักกันก่อนแก้ ทำให้ได้หลักฐานที่ใช้วินิจฉัยต้นเหตุได้ถูกจุด');
  if(S.users>=900)pros.push('รักษาฐานผู้ใช้ไว้ได้เกือบเท่าเดิม');
  if(!pros.length)pros.push('คุณเล่นมาจนจบและได้เห็นผลของทุกการตัดสินใจ ซึ่งเป็นข้อมูลสำหรับปรับแผนรอบหน้า');
  if(!fixed)cons.push('ต้นเหตุยังเหลืออยู่ (Rules หรือการคิดราคาฝั่ง client) จึงมีโอกาสถูกโจมตีซ้ำ');
  if(!S.mfa)cons.push('บัญชีแอดมินยังไม่มี 2-step ถ้ารหัสผ่านหลุดหรือถูกหลอกขอ จะไม่มีด่านที่สองรองรับ');
  if(S.covered)cons.push('เคยปิดบังเหตุจากลูกค้า ทำให้เสียความเชื่อใจเมื่อความจริงถูกเปิดเผย');
  if(S.wrongDx)cons.push('วินิจฉัยผิดจุดช่วงต้น ทำให้เสียเวลาและความเชื่อมั่น');
  if(S.damage>=30)cons.push('ข้อมูลหรือทรัพย์สินของร้านเสียหายค่อนข้างมาก ผลกระทบอาจตามมาอีก');
  if(S.users<500)cons.push('สูญเสียผู้ใช้มากกว่าครึ่ง การกู้ฐานลูกค้ากลับต้องใช้เวลา');
  if(!cons.length)cons.push('ไม่มีจุดอ่อนใหญ่จากการตัดสินใจ แต่ระบบจริงยังมีความเสี่ยงที่เกมนี้ไม่ได้ครอบคลุม');
  if(!fixed)recs.push('อุดต้นเหตุที่เหลือก่อนอย่างอื่น: ให้ Server คิดราคาและตรวจสิทธิ์เสมอ และจำกัด Rules เท่าที่จำเป็น');
  if(!S.mfa)recs.push('เปิด 2-step ให้บัญชีแอดมินทุกบัญชี และจำกัดจำนวนครั้งที่ล็อกอินผิด');
  if(S.covered)recs.push('เตรียมแผนสื่อสารเหตุละเมิดข้อมูล: ใครต้องรู้ เมื่อไร และบอกอะไร แล้วแจ้งผู้ได้รับผลกระทบ');
  recs.push('ตั้งการแจ้งเตือนอัตโนมัติ เช่น ออเดอร์ราคาผิดปกติ ล็อกอินผิดซ้ำ ล็อกอินจากอุปกรณ์ใหม่ เพื่อรู้ก่อนลูกค้า');
  recs.push('สำรองข้อมูลและทดสอบกู้คืนเป็นระยะ รวมถึงซ้อมแผนรับมือเหตุ เพื่อให้เหตุถัดไปจบเร็วขึ้น');
  return {pros,cons,recs:recs.slice(0,4)};
}
function renderResult(){
  const e=ENDINGS[S.endId];const sc=scoreOf(S,S.endId);
  const col=e.tone==='good'?'var(--green)':e.tone==='bad'?'var(--pink)':'var(--amber)';
  const R=54,C=2*Math.PI*R;
  const ax=axesHTML(),sl=summaryLists();
  const totalCh=choiceTotal();
  const coll=Object.keys(ENDINGS).map(k=>STORE.endings.indexOf(k)>=0?`<div class="got">\u2713 ${ENDINGS[k].title}</div>`:`<div>??? ยังไม่เคยเจอ</div>`).join('');
  app.innerHTML=`
  <div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step">บทสรุป</span></div>
  <section class="card ending ${e.tone}">
    <div class="kicker">ตอนจบของคุณ</div>
    <h2 data-focus tabindex="-1">${e.title}</h2><p>${e.desc}</p>
  </section>
  <section class="card">
    <div class="scorebox">
      <div class="ring" role="img" aria-label="คะแนนความเหมาะสม ${sc.total} จาก 100">
        <svg width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="${R}" fill="none" stroke="var(--surface2)" stroke-width="12"/>
        <circle cx="64" cy="64" r="${R}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(C*sc.total/100).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div class="v">${sc.total}</div></div>
      <div class="meta"><div class="grade" style="color:${col}">${gradeOf(sc.total)}</div>
        <p>คะแนนความเหมาะสมของแนวทางที่คุณเลือกต่อโจทย์นี้ (เต็ม 100) ผู้ใช้เหลือ <b>${fmtN(S.users)}</b> จาก ${fmtN(START_USERS)} คน</p></div>
    </div>
    <div class="parts">${sc.parts.map(p=>`<div class="part"><div class="pl"><span>${p.l}</span><span>${Math.round(p.v)}/${p.max}</span></div><div class="pb"><i style="width:${p.v/p.max*100}%"></i></div></div>`).join('')}
    ${sc.penalty?`<div class="part"><div class="pl"><span>หักคะแนนเพราะปิดบังเหตุจากลูกค้า</span><span>\u2212${sc.penalty}</span></div></div>`:''}</div>
  </section>
  <section class="card"><h2>เส้นทางผู้ใช้ตลอดเรื่อง</h2>${chartSVG()}</section>
  <section class="card"><h2>สไตล์การตัดสินใจของคุณ</h2>
    <p class="code" aria-label="รหัสสไตล์ ${ax.code}">${ax.code}</p>${ax.rows}
    <p class="note">S ความปลอดภัย / B ธุรกิจ · F เร็ว / C รอบคอบ · T โปร่งใส / I ภาพลักษณ์ · L ระยะยาว / N เฉพาะหน้า ไม่มีสไตล์ไหนถูกหรือผิด แต่แต่ละแบบมีจุดที่ต้องระวัง</p></section>
  <section class="card"><h2>ทบทวนทุกการตัดสินใจ</h2>${reviewHTML()}</section>
  <section class="card"><h2>ภาพรวมของแนวทางที่เลือก</h2>
    <div class="sub">ข้อดี</div><ul class="list pros">${sl.pros.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="sub">จุดอ่อน</div><ul class="list cons">${sl.cons.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="sub">ควรทำต่อ (เรียงตามความสำคัญ)</div><ol class="list recs">${sl.recs.map(x=>`<li>${x}</li>`).join('')}</ol>
  </section>
  <section class="card"><h2>ลองเส้นทางอื่น</h2>
    <p>ตอนจบที่เจอแล้ว ${STORE.endings.length}/${Object.keys(ENDINGS).length} · ตัวเลือกที่เคยลอง ${STORE.choices.length}/${totalCh}</p>
    <div class="coll">${coll}</div></section>
  <div class="row"><button class="primary" id="btnAgain">เล่นอีกครั้ง</button><button class="secondary" id="btnHome">กลับหน้าแรก</button></div>
  <p class="foot">เป็นเกมจำลองเพื่อการเรียนรู้ ตัวเลขผู้ใช้และคะแนนไม่ใช่สถิติจริง และไม่ใช่การรับรองว่าระบบจริงปลอดภัย</p>`;
  $('#btnAgain').onclick=begin;$('#btnHome').onclick=toStart;
  $('#live').textContent='บทสรุป คะแนน '+sc.total+' จาก 100';
}

/* ---------- kiosk idle reset (เปิดด้วย ?kiosk=1) ---------- */
let warnT=null,idleT=null,cdT=null;
function hideWarn(){$('#idle').classList.remove('on');}
function resetIdle(){
  clearTimeout(warnT);clearTimeout(idleT);clearInterval(cdT);hideWarn();
  if(!KIOSK||UI.screen==='start')return;
  warnT=setTimeout(()=>{
    let c=10;const m=$('#idleMsg');m.textContent='ไม่มีการใช้งาน จะกลับหน้าแรกใน '+c+' วินาที';
    $('#idle').classList.add('on');
    cdT=setInterval(()=>{c--;if(c>0)m.textContent='ไม่มีการใช้งาน จะกลับหน้าแรกใน '+c+' วินาที';},1000);
  },50000);
  idleT=setTimeout(()=>{hideWarn();toStart();},60000);
}
['pointerdown','keydown','touchstart','scroll'].forEach(ev=>window.addEventListener(ev,()=>{if(KIOSK)resetIdle();},{passive:true}));
$('#idleBtn').onclick=resetIdle;

toStart();