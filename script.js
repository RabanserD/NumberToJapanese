if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  }
  

const romanjiMap = new Map([
    ["0", "zero"], ["1", "ichi"], ["2", "ni"], ["3", "san"], ["4", "yon"], ["5", "go"], ["6", "roku"], ["7", "nana"], ["8", "hachi"], ["9", "kyuu"], ["10", "juu"], 
    ["100", "hyaku"], ["300", "sanbyaku"], ["600", "roppyaku"], ["800", "happyaku"], 
    ["1000", "sen"], ["3000", "sanzen"], ["8000", "hassen"], 
    ["10000", "man"],
    ["100000000", "oku"]
]);

const kanjiMap = new Map([
    ["0", "零"], ["1", "一"], ["2", "二"], ["3", "三"], ["4", "四"], ["5", "五"], ["6", "六"], ["7", "七"], ["8", "八"], ["9", "九"], ["10", "十"], 
    ["100", "百"], ["300", "三百"], ["600", "六百"], ["800", "八百"],
    ["1000", "千"], ["3000", "三千"], ["8000", "八千"],
    ["10000", "万"], 
    ["100000000", "億"]
     
]);

const hiraganaMap = new Map([
    ["0", "ゼロ"], ["1", "いち"], ["2", "に"], ["3", "さん"], ["4", "よん"], ["5", "ご"], ["6", "ろく"], ["7", "なな"], ["8", "はち"], ["9", "きゅう"], ["10", "じゅう"], 
    ["100", "ひゃく"], ["300", "さんびゃく"], ["600", "ろっぴゃく"], ["800", "はっぴゃく"],
    ["1000", "せん"], ["3000", "さんぜん"], ["8000", "はっせん"],
    ["10000", "まん"],
    ["100000000", "おく"]
]);

function convertNumber(number, dict) {
    // Check for decimals and handle error
    if (number.includes(".")) {
        return "Error: Decimals are not supported";
    }

    // Check if the number is greater than 999999999
    if (parseInt(number) > 999999999) {
        return "Error: Number is too large (greater than 999,999,999)";
    }

    // Validate for leading zeros or multiple zeros
    if (/^0\d/.test(number)) {
        return "Error: Leading zeros are not allowed";
    }
    

    if (number.length <= 4) {
        switch (number.length) {
            case 1:
                return dict.get(number); // For single digit
            case 2:
                return convertTwoDigits(number, dict); // Handle 2 digits
            case 3:
                return convertThreeDigits(number, dict); // Handle 3 digits
            case 4:
                return convertFourDigits(number, dict, true); // Handle 4 digits
            default:
                return "Invalid length"; // This is a fallback, should not happen here
        }
    } else {
        return convertLargeNumber(number, dict); // For numbers longer than 4 digits
    }
}


function convertTwoDigits(number, dict) {
    // Handle special case for 10
    if (number === "10") {
        return dict.get("10");
    }

    // Case where the first digit is 1, like 11-19
    if (number[0] === "1") {
        return dict.get("10") + (number[1] !== "0" ? " " + dict.get(number[1]) : "");
    }

    // Handle cases for multiples of 10, like 20, 30, etc.
    if (number[1] === "0") {
        return dict.get(number[0]) + " " + dict.get("10");
    }

    // General case for other two-digit numbers
    return dict.get(number[0]) + " " + dict.get("10") + " " + dict.get(number[1]);
}


function convertThreeDigits(number, dict) {
    // Handle special cases for 300, 600, and 800
    if (number === "300") {
        return dict.get("300");
    } else if (number === "600") {
        return dict.get("600");
    } else if (number === "800") {
        return dict.get("800");
    }

    // Special handling for "sanbyaku", "roppyaku", "happyaku" (300, 600, 800)
    if (number[0] === "3") {
        return dict.get("300") + " " + convertTwoDigits(number.slice(1), dict);
    } else if (number[0] === "6") {
        return dict.get("600") + " " + convertTwoDigits(number.slice(1), dict);
    } else if (number[0] === "8") {
        return dict.get("800") + " " + convertTwoDigits(number.slice(1), dict);
    }

    // General case for hundreds
    const hundreds = number[0] === "1" ? dict.get("100") : dict.get(number[0]) + " " + dict.get("100");
    
    // For non-zero tens and units, convert them as two-digit numbers
    if (number.slice(1) !== "00") {
        return hundreds + " " + convertTwoDigits(number.slice(1), dict);
    } else {
        return hundreds; // If tens and units are zero, return only hundreds part
    }
}


function convertFourDigits(number, dict) {
    // Handle special case for 1000
    if (number === "1000") {
        return dict.get("1000");
    } else if (number === "3000") {
        return dict.get("3000");
    } else if (number === "8000") {
        return dict.get("8000");
    }

    // Special handling for "sanzen", "hassen" (3000, 8000)
    if (number[0] === "3") {
        return dict.get("3000") + " " + convertThreeDigits(number.slice(1), dict);
    } else if (number[0] === "8") {
        return dict.get("8000") + " " + convertThreeDigits(number.slice(1), dict);
    }    

    // General case for thousands
    const thousands = number[0] === "1" ? dict.get("1000") : dict.get(number[0]) + " " + dict.get("1000");

    // Only append hundreds, tens, and units if they are non-zero
    if (number.slice(1) !== "000") {
        return thousands + " " + convertThreeDigits(number.slice(1), dict);
    } else {
        return thousands;
    }
}

function convertLargeNumber(number, dict) {
    const length = number.length;

    if (length > 8) {
        // Handle numbers with more than 8 digits, i.e., those requiring "oku" (億)
        const hundredsOfMillionsSegment = number.slice(0, -8);  // Digits up to 100 million
        const tenThousandsSegment = number.slice(-8, -4);  // Next 4 digits for "man" (万)
        const thousandsSegment = number.slice(-4);  // Last 4 digits (thousands)

        let result = "";

        // Convert hundreds of millions segment (億) if it's not zero
        if (parseInt(hundredsOfMillionsSegment) !== 0) {
            result += convertSegment(hundredsOfMillionsSegment, dict) + " " + dict.get("100000000") + " ";
        }

        // Convert ten-thousands segment (万) if it's not zero
        if (parseInt(tenThousandsSegment) !== 0) {
            result += convertSegment(tenThousandsSegment, dict) + " " + dict.get("10000") + " ";
        }

        // Convert thousands segment if it's not zero
        if (parseInt(thousandsSegment) !== 0) {
            result += convertSegment(thousandsSegment, dict);
        }

        return result.trim();
    } else if (length > 4) {
        // Handle numbers with 5-8 digits, which only need "man" (万)
        const tenThousandsSegment = number.slice(0, -4);  // Digits for "man" (万)
        const thousandsSegment = number.slice(-4);  // Last 4 digits (thousands)

        let result = "";

        // Convert ten-thousands segment (万) if it's not zero
        if (parseInt(tenThousandsSegment) !== 0) {
            result += convertSegment(tenThousandsSegment, dict) + " " + dict.get("10000") + " ";
        }

        // Convert thousands segment if it's not zero
        if (parseInt(thousandsSegment) !== 0) {
            result += convertSegment(thousandsSegment, dict);
        }

        return result.trim();
    }

    // For numbers less than 10,000, use the regular conversion function
    return convertSegment(number, dict);
}

function convertSegment(number, dict) {
    if (number.length === 1) {
        return dict.get(number);
    } else if (number.length === 2) {
        return convertTwoDigits(number, dict);
    } else if (number.length === 3) {
        return convertThreeDigits(number, dict);
    } else if (number.length === 4) {
        return convertFourDigits(number, dict);
    }
    return "";
}

// Attach event listener to update outputs while typing
document.getElementById("numberInput").addEventListener("input", function () {
    const number = this.value;
    document.getElementById("hiraganaOutput").innerText = convertNumber(number, hiraganaMap);
    document.getElementById("kanjiOutput").innerText = convertNumber(number, kanjiMap);
    document.getElementById("romajiOutput").innerText = convertNumber(number, romanjiMap);
});
