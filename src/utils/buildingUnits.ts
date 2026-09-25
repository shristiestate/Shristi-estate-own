import { Building, Property, FurnishingType } from '../types';

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
    area: 600,
    areaDisplay: '600 sq.ft.',
    type: 'Private Executive Suite',
    furnishing: 'Furnished',
    floor: '2nd Floor',
    features: ['8-10 Workstations', '1 Executive Cabin', 'Reception Lounge', 'High-Speed Elevators', '100% DG Backup'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 750,
    areaDisplay: '750 sq.ft.',
    type: 'Compact Corporate Office',
    furnishing: 'Plug-and-Play',
    floor: '3rd Floor',
    features: ['12 Modular Workstations', '1 Director Cabin', 'Conference Nook', 'Pantry Space', '24/7 Security'],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 900,
    areaDisplay: '900 sq.ft.',
    type: 'Modern Tech Workspace',
    furnishing: 'Furnished',
    floor: '4th Floor',
    features: ['16 Workstations', '2 Cabins', '6-Seater Meeting Room', 'Server Rack', 'Central Air Conditioning'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 1000,
    areaDisplay: '1,000 sq.ft.',
    type: 'Corporate Business Office',
    furnishing: 'Plug-and-Play',
    floor: '5th Floor',
    features: ['20 Workstations', '2 Executive Cabins', 'Conference Room', 'Reception Area', 'Reserved Parking'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 1200,
    areaDisplay: '1,200 sq.ft.',
    type: 'Furnished Corporate Suite',
    furnishing: 'Furnished',
    floor: '6th Floor',
    features: ['24 Linear Workstations', '2 Director Cabins', '8-Seater Boardroom', 'Wet Pantry', 'Direct Lift Access'],
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 1400,
    areaDisplay: '1,400 sq.ft.',
    type: 'Enterprise Tech Suite',
    furnishing: 'Semi-Furnished',
    floor: '4th Floor',
    features: ['Flexible Open Layout', '3 Manager Cabins', 'Conference Room', 'Fiber Backbone', 'Basement Parking'],
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 1600,
    areaDisplay: '1,600 sq.ft.',
    type: 'Executive Corporate Space',
    furnishing: 'Plug-and-Play',
    floor: '7th Floor',
    features: ['30 Workstations', '3 Executive Cabins', '10-Seater Conference Room', 'Server Room', 'Central HVAC'],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 1800,
    areaDisplay: '1,800 sq.ft.',
    type: 'Premium Corporate Suite',
    furnishing: 'Furnished',
    floor: '5th Floor',
    features: ['35 Workstations', '3 Director Cabins', '12-Seater Boardroom', 'Reception & Waiting Lounge', '2 Reserved Parking Bays'],
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 2200,
    areaDisplay: '2,200 sq.ft.',
    type: 'Mid-Size Corporate Office',
    furnishing: 'Plug-and-Play',
    floor: '8th Floor',
    features: ['45 Modular Workstations', '4 Cabins', 'Executive Boardroom', 'Cafeteria & Pantry', 'Biometric Access'],
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 2600,
    areaDisplay: '2,600 sq.ft.',
    type: 'Spacious Corporate Wing',
    furnishing: 'Furnished',
    floor: '6th Floor',
    features: ['55 Workstations', '4 Director Cabins', '14-Seater Boardroom', 'Dedicated Server Room', '3 Reserved Parking Slots'],
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 20000,
    areaDisplay: '20,000 sq.ft.',
    type: 'Full Floor Commercial Plate',
    furnishing: 'Bare Shell',
    floor: '2nd Floor',
    features: ['Complete Single Floor Plate', 'Panoramic Glazing', 'Core-and-Shell Ready', 'Dedicated High-Speed Lifts', '10 Reserved Car Bays'],
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 25000,
    areaDisplay: '25,000 sq.ft.',
    type: 'Corporate Headquarters Floor',
    furnishing: 'Plug-and-Play',
    floor: '3rd Floor',
    features: ['200+ Workstation Capacity', '8 Executive Cabins', 'Multiple Conference Rooms', 'Town Hall Area', '15 Reserved Parking Slots'],
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582650625119-3a31f841839d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 30000,
    areaDisplay: '30,000 sq.ft.',
    type: 'Enterprise Scale Floor Plate',
    furnishing: 'Semi-Furnished',
    floor: '5th Floor',
    features: ['High-Efficiency Floor Layout', 'Column-Free Design', 'Dual Utility Cores', '100% DG N+1 Redundancy', 'Dedicated Loading Bay'],
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f841839d?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 35000,
    areaDisplay: '35,000 sq.ft.',
    type: 'Independent Corporate Wing',
    furnishing: 'Bare Shell',
    floor: '7th Floor',
    features: ['Self-Contained Enterprise Wing', 'Dedicated Reception', '300+ Seater Layout', 'Restroom Clusters', '20 Covered Parking Bays'],
    image: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 40000,
    areaDisplay: '40,000 sq.ft.',
    type: 'Multi-Floor Enterprise Space',
    furnishing: 'Plug-and-Play',
    floor: '8th & 9th Floors',
    features: ['Two Connected Contiguous Floors', 'Internal Inter-Floor Staircase', 'Executive Boardrooms', 'Large Cafeteria', '25 Parking Bays'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 50000,
    areaDisplay: '50,000 sq.ft.',
    type: 'Large Enterprise Campus Block',
    furnishing: 'Bare Shell',
    floor: '3 Contiguous Floors',
    features: ['450+ Seater Scalability', 'Independent Security Access', 'Dual Power Infeeds', 'Dedicated High-Speed Lifts', '30 Parking Slots'],
    image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 60000,
    areaDisplay: '60,000 sq.ft.',
    type: 'Mega IT / Corporate Wing',
    furnishing: 'Plug-and-Play',
    floor: 'Multiple Floors',
    features: ['550+ Workstations Installed', 'Multiple Executive Floors', 'Auditorium & Town Hall', 'Dedicated DG Sets', '35 Reserved Bays'],
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 75000,
    areaDisplay: '75,000 sq.ft.',
    type: 'Dedicated Campus Tower Block',
    furnishing: 'Bare Shell',
    floor: 'Dedicated Block',
    features: ['Exclusive Tower Presence', 'Brand Signage Rights', 'Independent Building Lobby', 'Triple Basement Parking', '50+ Reserved Bays'],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 90000,
    areaDisplay: '90,000 sq.ft.',
    type: 'Full Commercial Tower Plate',
    furnishing: 'Bare Shell',
    floor: 'Dedicated Block',
    features: ['Corporate Campus Ecosystem', '800+ Headcount Capacity', 'Exclusive Access Control', 'Multi-Carrier Telecom Rooms', '60+ Parking Bays'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    area: 100000,
    areaDisplay: '1,00,000+ sq.ft.',
    type: 'Independent Enterprise Campus',
    furnishing: 'Bare Shell',
    floor: 'Entire Building / Campus',
    features: ['Full Standalone Campus Landmark', '1000+ Personnel Facility', 'Helipad / Sky Terrace Access', 'Independent Substation', '100+ Parking Bays'],
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
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

export function generateAvailablePropertiesForBuilding(building: Building): Property[] {
  const baseRate = extractBaseRate(building.rent_range);
  const cleanBuildingCode = building.slug.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'PROP';

  return STANDARD_BUILDING_UNITS.map((unit, index) => {
    // Slight realistic rate tiering: compact offices command a slightly higher per sqft rate, large floorplates get enterprise volume rates
    let unitRate = baseRate;
    if (unit.area <= 1000) unitRate = Math.round(baseRate * 1.08);
    else if (unit.area <= 2600) unitRate = baseRate;
    else if (unit.area >= 50000) unitRate = Math.max(35, Math.round(baseRate * 0.92));

    const monthlyPrice = Math.round(unit.area * unitRate);
    const priceDisplay = `₹${formatIndianCurrency(monthlyPrice)}/month`;
    const ratePerSqft = `₹${unitRate}/sq.ft`;

    const areaSlug = unit.area >= 100000 ? '100000-plus' : `${unit.area}`;
    const slug = `${areaSlug}-sqft-office-${building.slug}`;
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
      address: `${unit.floor}, ${towerName}, ${building.name}, ${building.address}`,
      city: 'Noida',
      built_up_area: unit.area,
      carpet_area: Math.round(unit.area * 0.72),
      area_unit: 'sq.ft',
      floor: unit.floor,
      total_floors: building.total_floors || 10,
      furnishing: unit.furnishing,
      parking: unit.area >= 20000 ? 'Dedicated multi-slot covered parking bays' : 'Reserved covered parking bay',
      power_load: building.power_backup || '100% DG Power Backup',
      possession: 'Immediate',
      description: `Grade-A ${unit.areaDisplay} ${unit.type.toLowerCase()} located on the ${unit.floor} of ${building.name}, ${building.location_name}. Designed for high efficiency operations with central air conditioning, 100% DG power backup, high-speed elevators, and round-the-clock commercial security.`,
      features: unit.features,
      amenities: (building.amenities && building.amenities.length > 0)
        ? building.amenities
        : ['Central Air Conditioning', 'High Speed Elevators', '24/7 Security & CCTV', 'Food Court', 'Power Backup', 'Visitor Parking'],
      primary_image: unit.image,
      gallery: unit.gallery,
      featured: index === 0 || index === 3 || index === 10,
      published: true,
      is_seed: true,
      created_at: '2026-03-01T09:00:00Z'
    };
  });
}
