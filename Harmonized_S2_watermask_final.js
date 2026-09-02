// ============================================================
// GANGA WATER MASKING USING SENTINEL-2 NDWI
// Dataset: COPERNICUS/S2_SR_HARMONIZED
// Period: JANUARY - APRIL 2026
// Interval: EVERY 15 DAYS
// Output: WATER MASK GEOTIFF ONLY
// Water = 1
// Non-water = 0
// ============================================================


// ============================================================
// 1. LOAD GANGA 5 KM BUFFER
// ============================================================

var gangaBuffer = ee.FeatureCollection(
  'projects/*******
);
// upload buffer or shape file

// ============================================================
// 2. GANGA GEOMETRY
// ============================================================

var gangaROI = gangaBuffer.geometry();

Map.centerObject(gangaROI, 11);


// ============================================================
// 3. SENTINEL-2 CLOUD MASK
// ============================================================

function maskS2Clouds(image) {

  var scl = image.select('SCL');

  // Keep:
  // 4  = Vegetation
  // 5  = Bare soil
  // 6  = Water
  // 7  = Unclassified

  var mask = scl.eq(4)
    .or(scl.eq(5))
    .or(scl.eq(6))
    .or(scl.eq(7));

  return image
    .updateMask(mask)
    .copyProperties(image, ['system:time_start']);
}


// ============================================================
// 4. FUNCTION TO CREATE 15-DAY WATER MASK
// ============================================================

function createWaterMask(startDate, endDate, periodName) {

  // ----------------------------------------------------------
  // Load Sentinel-2 for the selected 15-day period
  // ----------------------------------------------------------

  var s2 = ee.ImageCollection(
    'COPERNICUS/S2_SR_HARMONIZED'
  )
    .filterBounds(gangaROI)
    .filterDate(startDate, endDate)
    .filter(
      ee.Filter.lt(
        'CLOUDY_PIXEL_PERCENTAGE',
        30
      )
    )
    .map(maskS2Clouds);

  // Print number of images
  print(
    periodName + ' - Sentinel-2 images:',
    s2.size()
  );


  // ----------------------------------------------------------
  // Create median composite
  // ----------------------------------------------------------

  var image = s2
    .median()
    .clip(gangaROI);


  // ----------------------------------------------------------
  // Calculate NDWI
  // ----------------------------------------------------------

  // NDWI = (Green - NIR) / (Green + NIR)
  //
  // B3 = Green
  // B8 = NIR

  var ndwi = image
    .normalizedDifference([
      'B3',
      'B8'
    ])
    .rename('NDWI');


  // ----------------------------------------------------------
  // WATER THRESHOLD
  // ----------------------------------------------------------

  var waterThreshold = 0.03;


  // ----------------------------------------------------------
  // CREATE BINARY WATER MASK
  // ----------------------------------------------------------

  // 1 = Water
  // 0 = Non-water

  var waterMask = ndwi
    .gt(waterThreshold)
    .rename('water_mask')
    .toByte()
    .clip(gangaROI);


  // ----------------------------------------------------------
  // DISPLAY WATER MASK
  // ----------------------------------------------------------

  Map.addLayer(
    waterMask.selfMask(),
    {
      palette: ['0000FF']
    },
    periodName + ' Water Mask',
    false
  );


  // ----------------------------------------------------------
  // CALCULATE WATER AREA
  // ----------------------------------------------------------

  var waterArea = waterMask
    .multiply(ee.Image.pixelArea())
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: gangaROI,
      scale: 10,
      maxPixels: 1e13
    });


  print(
    periodName + ' Water Area (km²):',
    ee.Number(
      waterArea.get('water_mask')
    ).divide(1e6)
  );


  // ----------------------------------------------------------
  // EXPORT ONLY WATER MASK
  // ----------------------------------------------------------

  Export.image.toDrive({

    image: waterMask,

    description:
      'Ganga_WaterMask_' + periodName,

    folder:
      'Ganga_Water_Masks_Jan_Apr_2026',

    fileNamePrefix:
      'Ganga_WaterMask_' + periodName,

    region:
      gangaROI,

    scale:
      10,

    crs:
      'EPSG:4326',

    maxPixels:
      1e13,

    fileFormat:
      'GeoTIFF'
  });
}


// ============================================================
// 1. JANUARY 2026
// ============================================================

// 01 - 15 January
createWaterMask(
  '2026-01-01',
  '2026-01-16',
  '2026_01_01_15'
);


// 16 - 31 January
createWaterMask(
  '2026-01-16',
  '2026-02-01',
  '2026_01_16_31'
);


// ============================================================
// 2. FEBRUARY 2026
// ============================================================

// 01 - 15 February
createWaterMask(
  '2026-02-01',
  '2026-02-16',
  '2026_02_01_15'
);


// 16 - 28 February
createWaterMask(
  '2026-02-16',
  '2026-03-01',
  '2026_02_16_28'
);


// ============================================================
// 3. MARCH 2026
// ============================================================

// 01 - 15 March
createWaterMask(
  '2026-03-01',
  '2026-03-16',
  '2026_03_01_15'
);


// 16 - 31 March
createWaterMask(
  '2026-03-16',
  '2026-04-01',
  '2026_03_16_31'
);


// ============================================================
// 4. APRIL 2026
// ============================================================

// 01 - 15 April
createWaterMask(
  '2026-04-01',
  '2026-04-16',
  '2026_04_01_15'
);


// 16 - 30 April
createWaterMask(
  '2026-04-16',
  '2026-05-01',
  '2026_04_16_30'
);

// ============================================================
// 5. MAY 2026
// ============================================================

// 01 - 15 May
createWaterMask(
  '2026-05-01',
  '2026-05-16',
  '2026_05_01_15'
);


// 16 - 30 May
createWaterMask(
  '2026-05-16',
  '2026-06-01',
  '2026_05_16_30'
);
// ============================================================
// 5. June 2026
// ============================================================

// 01 - 15 June
createWaterMask(
  '2026-06-01',
  '2026-06-16',
  '2026_06_01_15'
);


// 16 - 30 June
createWaterMask(
  '2026-06-16',
  '2026-07-01',
  '2026_06_16_30'
);

// ============================================================
// 5. July 2026
// ============================================================

// 01 - 15 July
//createWaterMask(
  //'2026-07-01',
  //'2026-07-16',
  //'2026_07_01_15'
//);


// 16 - 30 July
//createWaterMask(
//  '2026-07-16',
//  '2026-08-01',
//  '2026_07_16_30'
//);




