import { Property, Building } from '../types';

export const WHATSAPP_NUMBER = '918750098666';

// Safe unicode escape sequences to prevent any character corruption across operating systems and browsers
const EMOJI_WAVE = '\u{1F44B}';      // 👋
const EMOJI_BUILDING = '\u{1F3E2}';  // 🏢
const EMOJI_LOCATION = '\u{1F4CD}';  // 📍
const EMOJI_TAG = '\u{1F3F7}\uFE0F'; // 🏷️
const EMOJI_RULER = '\u{1F4D0}';     // 📐
const EMOJI_MONEY = '\u{1F4B0}';     // 💰
const BULLET = '\u2022';             // •
const RUPEE = '\u20B9';              // ₹

/**
 * Format property category / type into a clean, human-readable label
 */
export function formatPropertyType(property: Property): string {
  if (property.property_type && property.property_type.trim() !== '') {
    return property.property_type;
  }
  switch (property.category) {
    case 'office-space':
      return 'Office Space';
    case 'it-business-parks':
      return 'IT & Business Park';
    case 'warehouses':
      return 'Warehouse & Logistics';
    case 'factory-industrial':
      return 'Factory & Industrial';
    case 'land':
      return 'Commercial Land';
    case 'shops-retail':
      return 'Shop / Retail';
    default:
      return 'Commercial Space';
  }
}

/**
 * Generates the official formatted WhatsApp message for a property enquiry
 */
export function generatePropertyWhatsAppMessage(property: Property, name?: string): string {
  const propertyTitle = property.title || property.reference_number || 'Commercial Property';
  const location = property.location_name || property.city || 'Noida';
  const type = formatPropertyType(property);
  const size = property.built_up_area 
    ? `${property.built_up_area.toLocaleString('en-IN')} ${property.area_unit || 'sq.ft'}`
    : 'Available on request';
  const price = property.price_display || (property.price ? `${RUPEE}${property.price.toLocaleString('en-IN')}` : 'Price on request');
  const clientName = name && name.trim() !== '' ? name.trim() : '[Name]';

  return `Hello Shristi Estate ${EMOJI_WAVE}

I am interested in the following property listed on your website:

${EMOJI_BUILDING} *Property:* ${propertyTitle}
${EMOJI_LOCATION} *Location:* ${location}
${EMOJI_TAG} *Property Type:* ${type}
${EMOJI_RULER} *Size:* ${size}
${EMOJI_MONEY} *Price/Rent:* ${price}

I would like to know more details about this property, including:
${BULLET} Availability
${BULLET} Final price/rent
${BULLET} Property specifications
${BULLET} Photos/videos
${BULLET} Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;
}

/**
 * Generates full https://wa.me/ URL for a property
 */
export function generatePropertyWhatsAppLink(property: Property, name?: string): string {
  const message = generatePropertyWhatsAppMessage(property, name);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates formatted WhatsApp message for a building/commercial project
 */
export function generateBuildingWhatsAppMessage(building: Building, name?: string): string {
  const buildingTitle = building.name || 'Commercial Project';
  const location = building.location_name || building.address || 'Noida';
  const type = building.category === 'it-business-parks' ? 'IT & Business Park' : 'Commercial Complex';
  const size = building.size_range || 'Multiple Unit Sizes Available';
  const price = building.rent_range || building.sale_range || 'Guidance on Request';
  const clientName = name && name.trim() !== '' ? name.trim() : '[Name]';

  return `Hello Shristi Estate ${EMOJI_WAVE}

I am interested in the following property listed on your website:

${EMOJI_BUILDING} *Property:* ${buildingTitle}
${EMOJI_LOCATION} *Location:* ${location}
${EMOJI_TAG} *Property Type:* ${type}
${EMOJI_RULER} *Size:* ${size}
${EMOJI_MONEY} *Price/Rent:* ${price}

I would like to know more details about this property, including:
${BULLET} Availability
${BULLET} Final price/rent
${BULLET} Property specifications
${BULLET} Photos/videos
${BULLET} Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;
}

/**
 * Generates full https://wa.me/ URL for a building
 */
export function generateBuildingWhatsAppLink(building: Building, name?: string): string {
  const message = generateBuildingWhatsAppMessage(building, name);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface GeneralEnquiryOptions {
  propertyName?: string;
  location?: string;
  propertyType?: string;
  size?: string;
  price?: string;
  clientName?: string;
}

/**
 * Generates structured WhatsApp message for general enquiries / consultation requests
 */
export function generateGeneralEnquiryMessage(options?: GeneralEnquiryOptions): string {
  const propertyTitle = options?.propertyName || 'Commercial Space Options';
  const location = options?.location || 'Noida / NCR';
  const type = options?.propertyType || 'Office / IT Park / Commercial Space';
  const size = options?.size || 'Flexible Size Options';
  const price = options?.price || 'Best Market Rate / Guidance on Request';
  const clientName = options?.clientName && options.clientName.trim() !== '' ? options.clientName.trim() : '[Name]';

  return `Hello Shristi Estate ${EMOJI_WAVE}

I am interested in the following property listed on your website:

${EMOJI_BUILDING} *Property:* ${propertyTitle}
${EMOJI_LOCATION} *Location:* ${location}
${EMOJI_TAG} *Property Type:* ${type}
${EMOJI_RULER} *Size:* ${size}
${EMOJI_MONEY} *Price/Rent:* ${price}

I would like to know more details about this property, including:
${BULLET} Availability
${BULLET} Final price/rent
${BULLET} Property specifications
${BULLET} Photos/videos
${BULLET} Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;
}

/**
 * Generates full https://wa.me/ URL for general enquiry
 */
export function generateGeneralEnquiryWhatsAppLink(options?: GeneralEnquiryOptions): string {
  const message = generateGeneralEnquiryMessage(options);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface RequirementEnquiryOptions {
  category?: string;
  preferredLocations?: string;
  listingType?: string;
  requiredArea?: string;
  budget?: string;
  name?: string;
}

/**
 * Generates full https://wa.me/ URL for requirement submission enquiry
 */
export function generateRequirementWhatsAppLink(options: RequirementEnquiryOptions): string {
  const propertyTitle = `${options.category || 'Commercial'} Requirement`;
  const location = options.preferredLocations || 'Noida / NCR';
  const type = options.category || 'Office / IT Park / Commercial';
  const size = options.requiredArea || 'Flexible Requirement';
  const price = options.budget ? `Budget: ${options.budget}` : 'Market Rate / Guidance';
  const clientName = options.name && options.name.trim() !== '' ? options.name.trim() : '[Name]';

  const message = `Hello Shristi Estate ${EMOJI_WAVE}

I am interested in the following property listed on your website:

${EMOJI_BUILDING} *Property:* ${propertyTitle}
${EMOJI_LOCATION} *Location:* ${location}
${EMOJI_TAG} *Property Type:* ${type}
${EMOJI_RULER} *Size:* ${size}
${EMOJI_MONEY} *Price/Rent:* ${price}

I would like to know more details about this property, including:
${BULLET} Availability
${BULLET} Final price/rent
${BULLET} Property specifications
${BULLET} Photos/videos
${BULLET} Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
