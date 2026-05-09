# Mamu Luxury Apartments

სასტუმრო/აპარტამენტების ვებ-საიტი Google Sheets ინტეგრაციით.

## გეგმა

### 1. საწყისი ვერსია
- მთავარი გვერდი ლამაზი hero სექციით
- ოთახების/აპარტამენტების ბარათები
- გალერეა
- ფასები და უპირატესობები
- საკონტაქტო/დაჯავშნის ფორმა

### 2. Google Sheets ინტეგრაცია
- Google Apps Script Web App მიიღებს ფორმის მონაცემებს
- დაჯავშნის მოთხოვნები ჩაიწერება Google Sheet-ში
- საიტზე API მისამართი ჩაიწერება `config.js` ფაილში

### 3. შემდეგი ეტაპი
- ოთახების ჩამონათვალი Google Sheet-დან წამოღება
- ხელმისაწვდომობის კალენდარი
- ენების დამატება: ქართული / ინგლისური / რუსული
- SEO და Facebook Pixel / Google Analytics

## ფაილები

- `index.html` — მთავარი გვერდი
- `styles.css` — დიზაინი
- `script.js` — ფორმის გაგზავნა და ინტერაქციები
- `config.js` — Google Apps Script API მისამართი
- `apps-script/Code.gs` — Google Sheets-ის მხარის კოდი

## გაშვება

1. გახსენი `index.html` ბრაუზერში ან ჩართე GitHub Pages.
2. Google Sheet-ში შექმენი Apps Script.
3. ჩასვი `apps-script/Code.gs` კოდი.
4. Deploy > Web App.
5. მიღებული URL ჩასვი `config.js` ფაილში `GOOGLE_SCRIPT_URL` მნიშვნელობაში.
