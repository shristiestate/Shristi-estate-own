import { Building, Property, FurnishingType } from '../types';
import { getSqFtImageForArea } from './unitSqftImages';

export interface UnitSpec {
  area: number;
  areaDisplay: string;
  type: string;
  furnishing: FurnishingType;
  floor: string;
  features: string[];
  image: string;
  gallery: string[];
}

export const STANDARD_BUILDING_UNITS: UnitSpec[] = [
  {
    area: 250,
    areaDisplay: '250 sq.ft.',
    type: 'Compact Startup Suite',
    furnishing: 'Furnished',
    floor: '1st Floor',
    features: ['4-6 Workstations', '1 Private Cabin', 'Reception Lounge', 'High-Speed Elevators', '100% DG Backup'],
    image: '/images/units/250/unit-250-200-sqft-entrance-lobby-1792171053177.jpg',
    gallery: [
      '/images/units/250/unit-250-200-sqft-exterior-facade-1792171053207.jpg',
      '/images/units/250/unit-250-200-sqft-floor-plan-1792171053211.jpg',
      '/images/units/250/unit-250-200-sqft-office-workspace-1792171053216.jpg'
    ]
  },
  {
    area: 600,
    areaDisplay: '600 sq.ft.',
    type: 'Private Executive Suite',
    furnishing: 'Furnished',
    floor: '2nd Floor',
    features: ['8-10 Workstations', '1 Executive Cabin', 'Reception Lounge', 'High-Speed Elevators', '100% DG Backup'],
    image: '/images/units/600/unit-600-600-700-sqft-cafeteria-food-court-1792171140031.jpg',
    gallery: [
      '/images/units/600/unit-600-600-700-sqft-cafeteria-food-court-2-1792171140036.jpg',
      '/images/units/600/unit-600-600-700-sqft-conference-room-1792171140047.jpg'
    ]
  },
  {
    area: 800,
    areaDisplay: '800 sq.ft.',
    type: 'Modern Corporate Suite',
    furnishing: 'Plug-and-Play',
    floor: '3rd Floor',
    features: ['12-14 Modular Workstations', '1 Director Cabin', 'Conference Nook', 'Pantry Space', '24/7 Security'],
    image: '/images/units/800/unit-800-800-900-sqft-exterior-facade-1792171284933.jpg',
    gallery: [
      '/images/units/800/unit-800-800-900-sqft-floor-plan-1792171284937.jpg',
      '/images/units/800/unit-800-800-900-sqft-office-workspace-1792171284941.jpg'
    ]
  },
  {
    area: 900,
    areaDisplay: '900 sq.ft.',
    type: 'Modern Tech Workspace',
    furnishing: 'Furnished',
    floor: '4th Floor',
    features: ['16 Workstations', '2 Cabins', '6-Seater Meeting Room', 'Server Rack', 'Central Air Conditioning'],
    image: '/images/units/900/unit-900-office-space-entrance-lobby-3-1792171634697.jpg',
    gallery: [
      '/images/units/900/unit-900-office-space-entrance-lobby-4-1792171634700.jpg',
      '/images/units/900/unit-900-office-space-entrance-lobby-5-1792171634705.jpg'
    ]
  },
  {
    area: 1000,
    areaDisplay: '1,000 sq.ft.',
    type: 'Corporate Business Office',
    furnishing: 'Plug-and-Play',
    floor: '5th Floor',
    features: ['20 Workstations', '2 Executive Cabins', 'Conference Room', 'Reception Area', 'Reserved Parking'],
    image: '/images/units/1000/unit-1000-office-space-conference-room-6-1792171704175.jpg',
    gallery: [
      '/images/units/1000/unit-1000-office-space-conference-room-4-1792171704170.jpg',
      '/images/units/1000/unit-1000-office-space-conference-room-7-1792171704178.jpg',
      '/images/units/1000/unit-1000-office-space-entrance-lobby-5-1792171704183.jpg'
    ]
  },
  {
    area: 1200,
    areaDisplay: '1,200 sq.ft.',
    type: 'Furnished Corporate Suite',
    furnishing: 'Furnished',
    floor: '6th Floor',
    features: ['24 Linear Workstations', '2 Director Cabins', '8-Seater Boardroom', 'Wet Pantry', 'Direct Lift Access'],
    image: '/images/units/1200/unit-1200-office-space-high-speed-elevators-1792171811587.jpg',
    gallery: [
      '/images/units/1200/unit-1200-office-space-floor-plan-5-1792171811583.jpg',
      '/images/units/1200/unit-1200-office-space-high-speed-elevators-2-1792171811590.jpg'
    ]
  },
  {
    area: 1500,
    areaDisplay: '1,500 sq.ft.',
    type: 'Enterprise Tech Suite',
    furnishing: 'Plug-and-Play',
    floor: '7th Floor',
    features: ['28-30 Modular Workstations', '3 Director Cabins', '10-Seater Conference Room', 'Wet Pantry & Server Room', '2 Covered Parking Bays'],
    image: '/images/units/1500/unit-1500-1400-1600-sqft-conference-room-1792172020133.jpg',
    gallery: [
      '/images/units/1500/unit-1500-1400-1600-sqft-entrance-lobby-1792172020136.jpg',
      '/images/units/1500/unit-1500-1400-1600-sqft-exterior-facade-2-1792172020139.jpg',
      '/images/units/1500/unit-1500-1400-1600-sqft-floor-plan-1792172020142.jpg'
    ]
  },
  {
    area: 1800,
    areaDisplay: '1,800 sq.ft.',
    type: 'Premium Corporate Suite',
    furnishing: 'Furnished',
    floor: '8th Floor',
    features: ['35 Workstations', '3 Director Cabins', '12-Seater Boardroom', 'Reception & Waiting Lounge', '2 Reserved Parking Bays'],
    image: '/images/units/1800/unit-1800-office-space-office-workspace-6-1792238449643.jpg',
    gallery: [
      '/images/units/1800/unit-1800-office-space-office-workspace-7-1792172368291.jpg',
      '/images/units/1800/unit-1800-office-space-office-workspace-8-1792172368307.jpg'
    ]
  },
  {
    area: 2000,
    areaDisplay: '2,000 sq.ft.',
    type: 'Executive Corporate Floor',
    furnishing: 'Plug-and-Play',
    floor: '9th Floor',
    features: ['40-45 Workstations', '4 Executive Cabins', '14-Seater Conference Room', 'Dedicated Reception & Cafeteria', '3 Reserved Parking Bays'],
    image: '/images/units/2000/unit-2000-2000-sqft-exterior-facade-1792493409027.jpg',
    gallery: [
      '/images/units/2000/unit-2000-2000-sqft-exterior-facade-1792493409027.jpg',
      '/images/units/2000/unit-2000-2000-sqft-floor-plan-1792493409037.jpg',
      '/images/units/2000/unit-2000-2000-sqft-office-workspace-1792493409038.jpg'
    ]
  }
];

export function extractBaseRate(rentRange?: string): number {
  if (!rentRange) return 55;
  const match = rentRange.match(/[₹]?\s*(\d+)/);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 55;
}

export function formatIndianCurrency(num: number): string {
  return num.toLocaleString('en-IN');
}

export function generateAvailablePropertiesForBuilding(building: Building, additionalDeletedSet?: Set<string>): Property[] {
  const baseRate = extractBaseRate(building.rent_range);
  const cleanBuildingCode = building.slug.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'PROP';
  const deletedSet = new Set([
    ...(Array.isArray(building.deleted_unit_ids) ? building.deleted_unit_ids : []),
    ...(additionalDeletedSet ? Array.from(additionalDeletedSet) : [])
  ]);

  return STANDARD_BUILDING_UNITS
    .filter(unit => {
      const unitId = `prop-${building.id}-${unit.area}`;
      const slug = `${unit.area}-sqft-office-${building.slug}`;
      const referenceNumber = `SE-${cleanBuildingCode}-${unit.area >= 1000 ? (unit.area / 1000) + 'K' : unit.area}`;
      return !deletedSet.has(unitId) && !deletedSet.has(slug) && !deletedSet.has(referenceNumber);
    })
    .map((unit, index) => {
    // Slight realistic rate tiering: compact offices command a slightly higher per sqft rate
    let unitRate = baseRate;
    if (unit.area <= 1000) unitRate = Math.round(baseRate * 1.08);
    else if (unit.area <= 1500) unitRate = Math.round(baseRate * 1.02);
    else unitRate = baseRate;

    const monthlyPrice = Math.round(unit.area * unitRate);
    const priceDisplay = `₹${formatIndianCurrency(monthlyPrice)}/month`;
    const ratePerSqft = `₹${unitRate}/sq.ft`;

    const slug = `${unit.area}-sqft-office-${building.slug}`;
    const referenceNumber = `SE-${cleanBuildingCode}-${unit.area >= 1000 ? (unit.area / 1000) + 'K' : unit.area}`;

    const towerName = building.towers && building.towers.length > 0 
      ? building.towers[index % building.towers.length] 
      : (building.tower_details || 'Main Tower');

    return {
      id: `prop-${building.id}-${unit.area}`,
      title: `${unit.areaDisplay} ${unit.type} in ${building.name}`,
      slug,
      reference_number: referenceNumber,
      category: building.category || 'office-space',
      property_type: unit.type,
      listing_type: 'Rent',
      status: index % 2 === 0 ? 'Ready to Move' : 'Available',
      price: monthlyPrice,
      price_display: priceDisplay,
      rate_per_sqft: ratePerSqft,
      rent_frequency: 'month',
      location_id: building.location_id,
      location_name: building.location_name,
      building_id: building.id,
      building_name: building.name,
      tower: towerName,
      address: building.address.toLowerCase().includes(building.name.toLowerCase())
        ? building.address
        : `${building.name}, ${building.address}`,
      city: 'Noida',
      built_up_area: unit.area,
      carpet_area: Math.round(unit.area * 0.72),
      area_unit: 'sq.ft',
      floor: unit.floor,
      total_floors: building.total_floors || 10,
      furnishing: unit.furnishing,
      parking: unit.area >= 1500 ? 'Dedicated multi-slot covered parking bays' : 'Reserved covered parking bay',
      power_load: building.power_backup || '100% DG Power Backup',
      possession: 'Immediate',
      description: `Grade-A ${unit.areaDisplay} ${unit.type.toLowerCase()} located on the ${unit.floor} of ${building.name}, ${building.location_name}. Designed for high efficiency operations with central air conditioning, 100% DG power backup, high-speed elevators, and round-the-clock commercial security.`,
      features: unit.features,
      amenities: (building.amenities && building.amenities.length > 0)
        ? building.amenities
        : ['Central Air Conditioning', 'High Speed Elevators', '24/7 Security & CCTV', 'Food Court', 'Power Backup', 'Visitor Parking'],
      primary_image: (() => {
        const override = getSqFtImageForArea(unit.area);
        return (override && override.primary_image) ? override.primary_image : unit.image;
      })(),
      gallery: (() => {
        const override = getSqFtImageForArea(unit.area);
        return (override && Array.isArray(override.gallery) && override.gallery.length > 0)
          ? override.gallery
          : unit.gallery;
      })(),
      featured: index === 0 || index === 2 || index === 4 || index === 7,
      published: true,
      is_seed: true,
      created_at: '2026-03-01T09:00:00Z'
    };
  });
}
