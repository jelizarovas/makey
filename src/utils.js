export const parseOurPrice = (input) => {
  // Convert input to string if it's a number
  const str = typeof input === "number" ? input.toString() : input;

  // Ensure str is a string
  if (typeof str !== "string") {
    return "0";
  }

  // Check for "call for price" in the string
  const callForPrice = /call for price/i;
  if (callForPrice.test(str)) {
    return "0";
  }

  // Check for HTML tags
  const htmlRegex = /<[^>]*>/;
  if (htmlRegex.test(str)) {
    return "0";
  }

  // Extract the first number found in the string
  const numberMatch = str.match(/\d+/);
  return numberMatch ? numberMatch[0] : "0";
};

export const parseCallForPrice = (str) => {
  const callForPriceRegex = /call for price/i;
  if (callForPriceRegex.test(str)) {
    return true;
  }
  return false;
};

export const parseNonAlphaNumeric = (str) => {
  const cleanedString = str.replace(/[^a-zA-Z0-9 ()]/g, "");
  return cleanedString;
};

export const parseStringToBoolean = (str) => {
  return str === "1";
};

export const parseDateToTimestamp = (dateString) => {
  const date = new Date(dateString);
  return date.getTime();
};

export const rairdonDealerships = {
  hob: {
    name: "Honda of Burien",
    address: "15026 1st Ave S, Burien, WA 98148",
    distanceToHoB: 0,
  },
  voe: {
    name: "Volkswagen of Everett",
    address: "10633 Evergreen Way, Everett, WA, 98204",
    distanceToHoB: 33.7,
  },
  dcjok: {
    name: "Dodge Chrysler Jeep of Kirkland",
    address: "12828 NE 124th St, Kirkland, WA 98034",
    distanceToHoB: 24.5,
  },
  dcjoma: {
    name: "Dodge Chrysler Jeep of Marysville",
    address: "16610 Smokey Point Blvd, Arlington, WA 98223",
    distanceToHoB: 52.1,
  },
  dcjomo: {
    name: "Dodge Chrysler Jeep of Monroe",
    address: "16413 W Main St, Monroe, WA 98272",
    distanceToHoB: 39.7,
  },
  dcjob: {
    name: "Dodge Chrysler Jeep of Bellingham",
    address: "1615 Iowa St, Bellingham, WA 98229",
    distanceToHoB: 99.6,
  },
  arok: {
    name: "Alfa Romeo of Kirkland",
    address: "12415 Slater Ave NE, Kirkland, WA 98034",
    distanceToHoB: 24.6,
  },
  mok: {
    name: "Maserati of Kirkland",
    address: "12415 Slater Ave NE, Kirkland, WA 98034",
    distanceToHoB: 24.6,
  },
  sob: {
    name: "Subaru of Auburn",
    address: "3025 Auburn Way N, Auburn, WA 98002",
    distanceToHoB: 16.4,
  },
  rao: {
    name: "Rairdon’s Auto Outlet",
    address: "14555 1st Ave S, Burien, WA 98166",
    distanceToHoB: 0.3,
  },
  hom: {
    name: "Honda of Marysville",
    address: "15714 Smokey Point Blvd, Marysville, WA 98271",
    distanceToHoB: 52.7,
  },
  hos: {
    name: "Honda of Sumner",
    address: "16302 Auto Ln, Sumner, WA 98390",
    distanceToHoB: 28.5,
  },
  noa: {
    name: "Nissan of Auburn",
    address: "713 35th St NE, Auburn, WA 98002",
    distanceToHoB: 16.2,
  },
  hobe: {
    name: "Hyundai of Bellingham",
    address: "1801 Iowa St, Bellingham, WA 98229",
    distanceToHoB: 99.8,
  },
  fok: {
    name: "FIAT of Kirkland",
    address: "12415 Slater Ave NE, Kirkland, WA 98034",
    distanceToHoB: 24.6,
  },
};

export const levenshteinDistance = (a, b) => {
  // Handle undefined or non-string inputs
  if (typeof a !== "string" || typeof b !== "string") {
    return a === b ? 0 : Math.max(a?.length || 0, b?.length || 0);
  }

  const matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const calculateSimilarity = (str1, str2) => {
  // Handle undefined or non-string inputs
  if (typeof str1 !== "string" || typeof str2 !== "string") {
    return str1 === str2 ? 1 : 0; // Return 1 if both are equal (including both undefined), else 0
  }

  const distance = levenshteinDistance(str1, str2);
  const longestLength = Math.max(str1.length, str2.length);
  return (longestLength - distance) / longestLength;
};

export const normalizeAddress = (address) => {
  if (typeof address !== "string") {
    return "";
  }

  // Convert to lowercase and remove <br/>, spaces, periods, and commas
  return address.toLowerCase().replace(/<br\/?>|[\s.,]/gi, "");
};

export const parseAddress = (inputAddress) => {
  const normalizedInput = normalizeAddress(inputAddress);
  let highestScore = 0;
  let bestMatch = null;

  for (let key in rairdonDealerships) {
    const score = calculateSimilarity(
      normalizedInput,
      normalizeAddress(rairdonDealerships[key].address)
    );

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rairdonDealerships[key];
    }
  }

  if (highestScore >= 0.8) {
    // 80% confidence threshold
    return bestMatch;
  } else {
    return { value: inputAddress };
  }
};

export const transformObject = (sourceObject, mapObject) => {
  const transformedObject = {};

  Object.keys(mapObject).forEach((newKey) => {
    const mapValue = mapObject[newKey];

    if (Array.isArray(mapValue)) {
      const [originalKey, transformFunction] = mapValue;
      transformedObject[newKey] = transformFunction(
        sourceObject[originalKey],
        sourceObject
      );
    } else {
      transformedObject[newKey] = sourceObject[mapValue];
    }
  });

  return transformedObject;
};

export const transformArray = (sourceArray, mapObject) => {
  return sourceArray.map((sourceObject) =>
    transformObject(sourceObject, mapObject)
  );
};

export const updateObject = (target, source) => {
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    if (sourceValue !== null && sourceValue !== "") {
      target[key] = sourceValue;
    }
  });
  return target;
};
