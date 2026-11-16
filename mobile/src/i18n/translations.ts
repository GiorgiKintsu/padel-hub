export type Language = 'ka' | 'en';
export const ka = {
  demo: 'სატესტო ვერსია', back: 'უკან', home: 'მთავარი', myBooking: 'ჩემი ჯავშანი',
  disclaimer: 'სატესტო მონაცემები • თანხა არ ჩამოიჭრება.\nჯავშანი ინახება მხოლოდ მიმდინარე სესიაში.',
  language: 'ენა', storageError: 'ენის დამახსოვრება ვერ მოხერხდა. ამ სესიაში არჩეული ენა იმუშავებს.',
  hello: 'გამარჯობა!', homeTitle: 'სად ვითამაშოთ\nდღეს?', when: 'როდის გინდა თამაში?', time: 'დრო', duration: 'ხანგრძლივობა',
  minutes: '{count} წთ', findBest: 'მაჩვენე საუკეთესო ვარიანტები →', searchHint: 'აირჩიე სასურველი დრო — ახლო ალტერნატივებსაც გაჩვენებთ.',
  nextGame: 'შენი შემდეგი თამაში', confirmed: 'სატესტო ჯავშანი დადასტურებულია', awaitingPayment: 'გადახდის მოლოდინში', viewBooking: 'ჯავშნის ნახვა',
  courtWaiting: 'მოედანი გელოდება', firstBooking: 'შენი პირველი სატესტო ჯავშანი აქ გამოჩნდება. დაიწყე სასურველი დროის არჩევით.',
  services: 'სხვა სერვისები', tournaments: 'ტურნირები', tournamentsDescription: 'მომავალი შეჯიბრებები და შედეგები',
  partners: 'მეწყვილის ძიება', partnersDescription: 'იპოვე შენი დონის მოთამაშე', trainers: 'ტრენერები', trainersDescription: 'ინდივიდუალური და ჯგუფური ვარჯიში', soon: 'მალე',
  freeCourts: 'თავისუფალი კორტები', bestOptions: 'საუკეთესო ვარიანტები', allCourts: 'ყველა კორტი',
  existingBooking: 'ამ სესიაში უკვე გაქვს სატესტო ჯავშანი. ახალი მცდელობისთვის ჯერ მიმდინარე ჯავშანი გაასუფთავე.',
  noTimes: 'თავისუფალი დრო ვერ მოიძებნა', chooseAnother: 'აირჩიე სხვა დღე ან ხანგრძლივობა.', changeSearch: 'ძიების შეცვლა',
  exactMatch: 'ზუსტი დამთხვევა', timeOffset: '{offset} წუთი სასურველ დროსთან', courtNumber: 'კორტი {number}', indoor: 'დახურული', outdoor: 'ღია', totalPrice: 'მთლიანი ფასი', reserve: 'დაჯავშნა',
  chooseCourt: 'აირჩიე კორტი', chooseCourtHint: 'ჯერ მოძებნე სასურველი დრო და კორტი.', viewCourts: 'კორტების ნახვა', summary: 'ჯავშნის შეჯამება',
  howPay: 'როგორ გადაიხდი?', payFull: 'სრულად', splitPeople: '{count} ადამიანზე', fullHint: 'ავტორი იხდის მთლიან თანხას.', splitHint: 'სრული თანხა თანაბრად იყოფა. ავტორს დარჩენილი თანხის დაფარვაც შეუძლია.',
  yourShare: 'შენი გადასახდელი', demoFee: 'მომსახურების საფასური ამ დემოში: {amount}.', demoScenario: 'ეს სატესტო სცენარია',
  timerRules: 'გადახდის დაწყებისას ჩაირთვება 5 წუთი. გაყოფის შემთხვევაში შენი წილის გადახდის შემდეგ მეგობრებს 10 წუთი ექნებათ.',
  simulationHint: 'რეალური მოწვევა და ბარათით გადახდა ჯერ არ იგზავნება. მეგობრების გადახდას შემდეგ ეკრანზე თავად გამოსცდი.',
  noLongerAvailable: 'არჩეული დრო აღარ არის ხელმისაწვდომი. დაბრუნდი ძიებაზე.', viewCurrent: 'მიმდინარე ჯავშნის ნახვა', startPayment: 'სატესტო გადახდის დაწყება',
  noBooking: 'ჯერ ჯავშანი არ გაქვს', noBookingHint: 'აირჩიე დრო და გამოსცადე პირველი ჯავშანი.', findCourt: 'კორტის მოძებნა', expired: 'გადახდის ვადა ამოიწურა',
  authorTime: 'ავტორის გადახდისთვის დარჩენილია', friendsTime: 'მეგობრების გადახდისთვის დარჩენილია',
  expiryHint: 'ვადის გასვლისას მცდელობა გაუქმდება. რეალური თანხა ამ დემოში არ იჭრება.', paymentStatus: 'გადახდის მდგომარეობა', author: 'შენ · ავტორი', friend: 'სატესტო მეგობარი {number}',
  refunded: 'სატესტო დაბრუნება', unpaid: 'არ გადახდილა', paid: 'სატესტოდ გადახდილია', covered: 'ავტორმა დაფარა', pending: 'მოლოდინში',
  simulateMine: 'ჩემი გადახდის სიმულაცია', simulateFriend: 'მეგობარი {number}: გადახდის სიმულაცია', totalPaid: 'სულ გადახდილია', coverRemaining: 'დარჩენილი {amount} თავად დავფარო',
  courtReleased: 'კორტი გათავისუფლდა', refundExplanation: 'სატესტო დაბრუნება: {amount}. რეალურ ანგარიშზე ცვლილება არ მომხდარა.', clearBooking: 'სატესტო ჯავშნის გასუფთავება',
};
export type TranslationKey = keyof typeof ka;
export const en: Record<TranslationKey, string> = {
  demo: 'Demo version', back: 'Back', home: 'Home', myBooking: 'My booking',
  disclaimer: 'Demo data • No real charges.\nBookings are kept only for this session.',
  language: 'Language', storageError: 'Could not save your language. Your choice will still work in this session.',
  hello: 'Hello!', homeTitle: 'Where shall we\nplay today?', when: 'When would you like to play?', time: 'Time', duration: 'Duration',
  minutes: '{count} min', findBest: 'Find the best options →', searchHint: 'Pick your preferred time — we’ll show nearby alternatives too.',
  nextGame: 'Your next game', confirmed: 'Demo booking confirmed', awaitingPayment: 'Awaiting payment', viewBooking: 'View booking',
  courtWaiting: 'The court is waiting', firstBooking: 'Your first demo booking will appear here. Start by choosing a time.',
  services: 'More ways to play', tournaments: 'Tournaments', tournamentsDescription: 'Upcoming competitions and results',
  partners: 'Find a partner', partnersDescription: 'Meet players at your level', trainers: 'Coaches', trainersDescription: 'Private and group training', soon: 'Coming soon',
  freeCourts: 'Available courts', bestOptions: 'Best options', allCourts: 'All courts',
  existingBooking: 'You already have a demo booking in this session. Clear it before trying a new one.',
  noTimes: 'No available times', chooseAnother: 'Choose another day or duration.', changeSearch: 'Change search',
  exactMatch: 'Exact match', timeOffset: '{offset} min from your preferred time', courtNumber: 'Court {number}', indoor: 'Indoor', outdoor: 'Outdoor', totalPrice: 'Total price', reserve: 'Book court',
  chooseCourt: 'Choose a court', chooseCourtHint: 'Find your preferred court and time first.', viewCourts: 'View courts', summary: 'Booking summary',
  howPay: 'How would you like to pay?', payFull: 'In full', splitPeople: '{count} people', fullHint: 'The booking owner pays the full amount.', splitHint: 'The total is split equally. The owner can also cover the remaining amount.',
  yourShare: 'Your share', demoFee: 'Service fee in this demo: {amount}.', demoScenario: 'This is a demo',
  timerRules: 'You have 5 minutes to make your payment. When splitting, your friends get 10 minutes after you pay your share.',
  simulationHint: 'No real invitations or card payments are sent. You can simulate your friends’ payments on the next screen.',
  noLongerAvailable: 'This time is no longer available. Go back to search.', viewCurrent: 'View current booking', startPayment: 'Start demo payment',
  noBooking: 'No booking yet', noBookingHint: 'Choose a time and try your first booking.', findCourt: 'Find a court', expired: 'Payment time expired',
  authorTime: 'Time left for your payment', friendsTime: 'Time left for your friends',
  expiryHint: 'The booking attempt expires when time runs out. This demo does not charge real money.', paymentStatus: 'Payment status', author: 'You · Owner', friend: 'Demo friend {number}',
  refunded: 'Demo refund', unpaid: 'Not paid', paid: 'Demo payment received', covered: 'Covered by the owner', pending: 'Pending',
  simulateMine: 'Simulate my payment', simulateFriend: 'Friend {number}: simulate payment', totalPaid: 'Total paid', coverRemaining: 'Cover the remaining {amount}',
  courtReleased: 'The court is available again', refundExplanation: 'Demo refund: {amount}. No real account was affected.', clearBooking: 'Clear demo booking',
};
export const translations = { ka, en };
export function translate(language: Language, key: TranslationKey, params: Record<string, string | number> = {}) {
  return translations[language][key].replace(/\{(\w+)\}/g, (token, name: string) => params[name] === undefined ? token : String(params[name]));
}
const weekdays = { ka: ['კვ', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
const months = { ka: ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
export function formatWeekday(date: Date, language: Language) { return weekdays[language][date.getDay()]; }
export function formatDate(day: string, language: Language) { const date = new Date(`${day}T12:00:00`); return `${date.getDate()} ${months[language][date.getMonth()]}`; }
export function isLanguage(value: unknown): value is Language { return value === 'ka' || value === 'en'; }
