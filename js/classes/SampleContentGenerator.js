class SampleContentGenerator {

    constructor(sampleImages, sampleVideos, sampleFiles) {
        this.sampleWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];
        this.numSampleWords = this.sampleWords.length;
        this.sampleImages = sampleImages;
        this.sampleVideos = sampleVideos;
        this.sampleFiles = sampleFiles;
    }

    getRandomWord() {
        return this.sampleWords[Math.floor(Math.random() * this.numSampleWords)];
    }

    getButtonText() {
        const buttonTexts = ["Learn More", "Read More", "Get Started", "Sign Up", "Shop Now", "Explore", "Discover", "Find Out More", "View Details", "Learn Now", "Join Us", "See Plans", "Try for Free", "Subscribe Now", "Shop Online", "Download Now", "Start Trial", "Get In Touch", "See Features", "Shop Sale", "See Pricing", "Browse Products", "Learn About Us", "Visit Our Website", "Request Demo", "Create Account", "Find a Store", "Watch Video", "View Demo", "Request Information", "Contact Us", "Get a Quote", "Apply Now", "Join Newsletter", "Shop Collection", "Check Availability", "Explore More", "Request a Callback", "Book Now", "See Menu", "Claim Your Offer", "Apply Coupon", "Get Help", "Vote Now", "Donate Now", "Book Appointment", "See All Products", "Enroll Now", "Get Quote", "Send Message", "Apply Discount", "Share Now", "Get Support", "Upgrade Now", "Get Updates", "Visit Blog", "Shop Accessories", "Track Order", "Apply Promo Code", "Give Feedback", "View Services", "Reserve Now", "Book Tickets", "Access Now", "Start Quiz", "Join Community", "Review Details", "Explore Careers", "Submit Application", "Unlock Content", "Complete Survey", "Claim Your Prize"];
        const randomIndex = SampleContentGenerator.arrayGetRandomIndex(buttonTexts);      
        return buttonTexts[randomIndex];
    }

    static getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static rollGiantDice() {
        return (Math.random() * 100);
    }

    static arrayGetRandomIndex(arr) {
        return SampleContentGenerator.getRandomNumber(0, arr.length - 1);
    }

    arrayUnique(arr) {
        return arr.filter((value, index, array) => {
            return array.indexOf(value) === index;
        });
    }

    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatBytes(bytes, decimals) {
        if(bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getHeading(level) {
        const numWordsInHeading = SampleContentGenerator.getRandomNumber(3, 8);
        let heading = [];

        for (let j = 0; j < numWordsInHeading; j++) {
            heading.push(this.getRandomWord());
        }

        // Capitalize first letter
        heading =  heading.join(' ');
        heading = this.capitalizeFirstLetter(heading);
        
        return `<h${level}>${heading}</h${level}>`;
    }

    getBulletList() {
        const numItems = SampleContentGenerator.getRandomNumber(3, 8);
        let list = [];

        for (let j = 0; j < numItems; j++) {
            list.push(`<li>${this.getSentence()}</li>`);
        }

        list = list.join('');
        return `<ul>${list}</ul>`;
    }

    getSentence() {

        const numWordsInSentence = SampleContentGenerator.getRandomNumber(4, 12);
        let sentence = [];

        for (let j = 0; j < numWordsInSentence; j++) {

            const currentWord = this.getRandomWord();
        
            // Add a comma with 20% probability between words (except at the end of a sentence)
            if (j < numWordsInSentence - 1 && Math.random() < 0.2) {
                sentence.push(currentWord + ',');
            } else {
                sentence.push(currentWord);
            }
    
        }

        // Capitalize first letter
        sentence =  sentence.join(' ');
        sentence = this.capitalizeFirstLetter(sentence);
        
        return `${sentence}.`;

    }

    getNiceLimitedText(str, maxChars) {

        if ( maxChars == 1 ) 
            str = this.getRandomWord()[0];

        if ( str.length && str.length > maxChars ) {

            let strWords = str.split(' ');
            let didHavePeriod = str[str.length-1] == '.';

            if ( strWords.length > 1 ) {

                let hadToPop = false;
                while( strWords.join(' ').length > maxChars ) {
                    hadToPop = true;
                    strWords.pop();
                }

                str = strWords.join(' ');
    
                if ( hadToPop && didHavePeriod ) {
                    str += '.';
                }
    
            }
            else {
                str = str.substring(0, (didHavePeriod ? (maxChars - 1) : maxChars));
                if ( didHavePeriod ) {
                    str += '.';
                }
            }

        }

        return str.replace(',.', '.').trim();

    }

    getLineText(maxChars) {
        maxChars = maxChars ? maxChars : 50;
        return this.getNiceLimitedText(this.getSentence(), maxChars);
    }

    getParagraphText(maxChars) {

        maxChars = maxChars ? maxChars : 300;
    
        // If for some reason maxChars length is 1, we'll just return a random first letter from wordList.
        // If we didn't, likely a "." would be returned as the first character every time
        if ( maxChars == 1 ) {
            return this.getRandomWord()[0];
        }
    
        // We'll reduce the limit by one to account for the last period in the string
        if ( maxChars > 1 )
            maxChars -= 1;
        
        // Generate the lorem ipsum text
        let loremIpsum = [];
        let endReached = false;
    
        while (!endReached) {

            loremIpsum.push(this.getSentence());

            if ( loremIpsum.join(' ').length > maxChars ) {
                loremIpsum = this.getNiceLimitedText(loremIpsum.join(' '), maxChars);
                endReached = true;
            }

        }
        
        return loremIpsum;
    }

    getSingleParagraphContent() {
        return this.getWysiwygContent(1);
    }

    getMultiParagraphContent() {
        const numParagraphs = SampleContentGenerator.getRandomNumber(2, 3);
        return this.getWysiwygContent(numParagraphs);
    }

    getWysiwygContent(numParagraphs = 1) {

        const possibleWraps = ['strong', 'em', 'a'];
        const paragraphs    = [];
        for( let p = 0; p < numParagraphs; p++ ) {

            const numChars  = SampleContentGenerator.getRandomNumber(500, 1200);
            const paragraph = this.getParagraphText(numChars);
            const words     = paragraph.split(' ');

            for( let i = 0; i < possibleWraps.length; i++ ) {
                if ( SampleContentGenerator.getRandomNumber(1, 2) == 2 ) {
                    const randWordIndex = SampleContentGenerator.arrayGetRandomIndex(words);
                    if ( possibleWraps[i] == 'a' ) {
                        words[randWordIndex] = `<${possibleWraps[i]} href="${this.getURL()}">${words[randWordIndex]}</${possibleWraps[i]}>`;
                    }
                    else {
                        words[randWordIndex] = `<${possibleWraps[i]}>${words[randWordIndex]}</${possibleWraps[i]}>`;
                    }
                }
            }

            paragraphs.push('<p>' + words.join(' ') + '</p>');

        }

        return paragraphs.join('');
        
    }

    getEmail() {
        const sampleNames =  ['john', 'alice', 'bob', 'emma', 'david', 'sarah', 'alex', 'olivia', 'michael', 'lisa', 'ryan', 'jennifer', 'kevin', 'amy', 'chris', 'nicole', 'adam.smith', 'jane.doe', 'robert.jones', 'mary.lee', 'samuel1990', 'emily1985', 'ashley123', 'brian1978'];
        const sampleDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com', 'yourdomain.com'];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomDomain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];
        const email = `${randomName}@${randomDomain}`;
        return email;
    }

    getURL() {
        const baseUrls = ['https://example.com', 'https://yourwebsite.com', 'https://sampleurl.com'];
        const randomBaseUrl = baseUrls[Math.floor(Math.random() * baseUrls.length)];
        const humanPaths = ['', 'home', 'about-us', 'our-services', 'contact-us', 'products', 'blog', 'portfolio', 'faq', 'careers', 'support', 'events'];
        const randomPath = humanPaths[Math.floor(Math.random() * humanPaths.length)];
        const url = randomPath ? `${randomBaseUrl}/${randomPath}` : randomBaseUrl;
        return url;
    }

    getOEmbedUrl() {
        const baseUrls = ['https://www.youtube.com/watch?v=fm9Nb6IpCN0', 'https://www.youtube.com/watch?v=jKMJJOhPOco', 'https://www.youtube.com/watch?v=C5XfSzBxSg0'];
        const randomIndex = SampleContentGenerator.arrayGetRandomIndex(baseUrls);
        return baseUrls[randomIndex];
    }

    getPassword() {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';

        let password = '';
        let length = SampleContentGenerator.getRandomNumber(12, 18);
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }

        return password;
    }

    getSampleAttachment(size, requiredTypes, minWidth, minHeight, maxWidth, maxHeight, minSize, maxSize, skipIds = []) {
     
        let sampleAttachment    = null;

        if ( this.sampleImages ) {

            if ( !requiredTypes.length ) {
                requiredTypes = this.getAllAvailableImageTypes();
            }

            let indexesTried        = [];

            while ( indexesTried.length < this.sampleImages.length ) {

                const randomIndex = SampleContentGenerator.arrayGetRandomIndex(this.sampleImages);

                if ( !indexesTried.includes(randomIndex) ) {

                    const randomFile    = this.sampleImages[randomIndex];
                    const fileSizeMb    = randomFile.filesize / 1024 / 1024;
                    const fileType      = randomFile.subtype;
                    const imageWidth    = randomFile.width;
                    const imageHeight   = randomFile.height;

                    if ( requiredTypes.includes(fileType) 
                        && !skipIds.includes(randomFile.id) 
                        && fileSizeMb > minSize 
                        && fileSizeMb < maxSize 
                        && imageWidth <= maxWidth 
                        && imageWidth >= minWidth 
                        && imageHeight <= maxHeight 
                        && imageHeight >= minHeight 
                    ) {
                        sampleAttachment = {
                            id: 'id',
                            attributes: {
                                id: randomFile.ID,
                                type: 'image',
                                url: randomFile.sizes[size],
                                title: randomFile.title,
                                filename: randomFile.filename,
                                filesizeHumanReadable: this.formatBytes(randomFile.filesize, 0)
                            }
                        }
                        break;
                    }
                    
                    indexesTried.push(randomIndex);

                }

            }

        }

        return sampleAttachment;

    }

    getAllAvailableFileTypes(pool) {

        const sampleInventory = pool == 'videos' ? this.sampleVideos : this.sampleFiles;
        let types = [];
        
        if ( sampleInventory.length ) {
            for( let i = 0; i < sampleInventory.length; i++ ) {
                const prop = sampleInventory[i].hasOwnProperty('file') ? 'file' : 'video';
                const type = sampleInventory[i][prop].subtype;
                if ( !types.includes(type) ) {
                    types.push(type);
                }
            }
        }

        return types;

    }


    getAllAvailableImageTypes() {

        let types = [];
        
        if ( this.sampleImages.length ) {
            for( let i = 0; i < this.sampleImages.length; i++ ) {
                const type = this.sampleImages[i].subtype;
                if ( !types.includes(type) ) {
                    types.push(type);
                }
            }
        }

        return types;

    }

    getSampleFile(requiredTypes, minSize, maxSize, pool) {

        const sampleInventory = pool == 'video' ? this.sampleVideos : this.sampleFiles;

        if ( sampleInventory ) {

            if ( !requiredTypes.length )
                requiredTypes = this.getAllAvailableFileTypes();

            let sampleAttachment    = null;
            let indexesTried        = [];

            while ( indexesTried.length < sampleInventory.length ) {

                const randomIndex = SampleContentGenerator.getRandomNumber(0, (sampleInventory.length - 1));

                if ( !indexesTried.includes(randomIndex) ) {

                    const prop          = sampleInventory[randomIndex].hasOwnProperty('file') ? 'file' : 'video';
                    const randomFile    = sampleInventory[randomIndex][prop];
                    const fileSizeMb    = randomFile.filesize / 1024 / 1024;
                    const fileType      = randomFile.subtype;
                    
                    if ( requiredTypes.includes(fileType) && fileSizeMb > minSize && fileSizeMb < maxSize ) {
                        sampleAttachment = {
                            id: 'id',
                            attributes: {
                                id: randomFile.ID,
                                type: 'video',
                                url: randomFile.url,
                                title: randomFile.title,
                                filename: randomFile.filename,
                                filesizeHumanReadable: this.formatBytes(randomFile.filesize, 0)
                            }
                        }
                        break;
                    }
                    
                    indexesTried.push(randomIndex);

                }

            }

            return sampleAttachment;

        }

        return false;
        
    }

    getLatLngCoordinates() {
        const coords = [
            { lat: 40.7128, lng: -74.0060 },   // New York City
            { lat: 34.0522, lng: -118.2437 },  // Los Angeles
            { lat: 51.5074, lng: -0.1278 },    // London
            { lat: 48.8566, lng: 2.3522 },     // Paris
            { lat: -33.8688, lng: 151.2093 },  // Sydney
            { lat: 35.6895, lng: 139.6917 },   // Tokyo
            { lat: 37.7749, lng: -122.4194 },  // San Francisco
            { lat: 41.9028, lng: 12.4964 },    // Rome
            { lat: 55.7558, lng: 37.6176 },    // Moscow
            { lat: 40.4168, lng: -3.7038 },    // Madrid
            { lat: -22.9068, lng: -43.1729 },  // Rio de Janeiro
            { lat: -37.8136, lng: 144.9631 },  // Melbourne
            { lat: 51.1657, lng: 10.4515 },    // Germany
            { lat: 55.7558, lng: -3.9869 },    // Edinburgh
            { lat: 45.4215, lng: -75.6993 },   // Ottawa
            { lat: 48.8566, lng: -123.3832 },  // Victoria
            { lat: 32.7767, lng: -96.7970 },   // Dallas
            { lat: 19.4326, lng: -99.1332 },   // Mexico City
            { lat: -34.6118, lng: -58.4173 },  // Buenos Aires
            { lat: -33.4489, lng: -70.6693 }   // Santiago
        ];
        const randIndex =  SampleContentGenerator.arrayGetRandomIndex(coords);
        return coords[randIndex];
    }

    getDate() {
        const currentDate = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);
        const randomTime = currentDate.getTime() + Math.random() * (oneYearFromNow.getTime() - currentDate.getTime());
        const randomDate = new Date(randomTime);
        return randomDate;
    }

    getColour() {
        const randomColorInt = Math.floor(Math.random() * 16777216);
        const hexColor = '#' + randomColorInt.toString(16).padStart(6, '0');
        return hexColor;
    }

}