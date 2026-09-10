import { Property, Building } from '../types';

export const WHATSAPP_NUMBER = '918750098666';

/**
 * Helper to build direct WhatsApp API URL
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}

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
 * Generates the clean professional formatted WhatsApp message for a property enquiry
 * (Free of 4-byte emoji encoding artifacts that cause diamond question mark errors)
 */
export function generatePropertyWhatsAppMessage(property: Property, name?: string): string {
  const propertyTitle = property.title || property.reference_number || 'Commercial Property';
  const location = property.location_name || property.city || 'Noida';
  const type = formatPropertyType(property);
  const size = property.built_up_area 
    ? `${property.built_up_area.toLocaleString('en-IN')} ${property.area_unit || 'sq.ft'}`
    : 'Available on request';
  const price = property.price_display || (property.price ? `₹${property.price.toLocaleString('en-IN')}` : 'Price on request');
  const clientName = name && name.trim() !== '' ? name.trim() : '[Name]';

  return `Hello Shristi Estate,

I am interested in the following property listed on your website:

*Property:* ${propertyTitle}
*Location:* ${location}
*Property Type:* ${type}
*Size:* ${size}
*Price/Rent:* ${price}

I would like to know more details about this property, including:
- Availability
- Final price/rent
- Property specifications
- Photos/videos
- Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;
}

/**
 * Generates full direct WhatsApp URL for a property
 */
export function generatePropertyWhatsAppLink(property: Property, name?: string): string {
  const message = generatePropertyWhatsAppMessage(property, name);
  return buildWhatsAppUrl(message);
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

  return `Hello Shristi Estate,

I am interested in the following property listed on your website:

*Property:* ${buildingTitle}
*Location:* ${location}
*Property Type:* ${type}
*Size:* ${size}
*Price/Rent:* ${price}

I would like to know more details about this property, including:
- Availability
- Final price/rent
- Property specifications
- Photos/videos
- Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;
}

/**
 * Generates full direct WhatsApp URL for a building
 */
export function generateBuildingWhatsAppLink(building: Building, name?: string): string {
  const message = generateBuildingWhatsAppMessage(building, name);
  return buildWhatsAppUrl(message);
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
 * Generates clean structured WhatsApp message for general enquiries / consultation requests
 */
export function generateGeneralEnquiryMessage(options?: GeneralEnquiryOptions): string {
  const propertyTitle = options?.propertyName || 'Commercial Space Options';
  const location = options?.location || 'Noida / NCR';
  const type = options?.propertyType || 'Office / IT Park / Commercial Space';
  const size = options?.size || 'Flexible Size Options';
  const price = options?.price || 'Best Market Rate / Guidance on Request';
  const clientName = options?.clientName && options.clientName.trim() !== '' ? options.clientName.trim() : '[Name]';

  return `Hello Shristi Estate,

I am interested in the following property listed on your website:

*Property:* ${propertyTitle}
*Location:* ${location}
*Property Type:* ${type}
*Size:* ${size}
*Price/Rent:* ${price}

I would like to know more details about this property, including:
- Availability
- Final price/rent
- Property specifications
- Photos/videos
- Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;
}

/**
 * Generates full direct WhatsApp URL for general enquiry
 */
export function generateGeneralEnquiryWhatsAppLink(options?: GeneralEnquiryOptions): string {
  const message = generateGeneralEnquiryMessage(options);
  return buildWhatsAppUrl(message);
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
 * Generates full direct WhatsApp URL for requirement submission enquiry
 */
export function generateRequirementWhatsAppLink(options: RequirementEnquiryOptions): string {
  const propertyTitle = `${options.category || 'Commercial'} Requirement`;
  const location = options.preferredLocations || 'Noida / NCR';
  const type = options.category || 'Office / IT Park / Commercial';
  const size = options.requiredArea || 'Flexible Requirement';
  const price = options.budget ? `Budget: ${options.budget}` : 'Market Rate / Guidance';
  const clientName = options.name && options.name.trim() !== '' ? options.name.trim() : '[Name]';

  const message = `Hello Shristi Estate,

I am interested in the following property listed on your website:

*Property:* ${propertyTitle}
*Location:* ${location}
*Property Type:* ${type}
*Size:* ${size}
*Price/Rent:* ${price}

I would like to know more details about this property, including:
- Availability
- Final price/rent
- Property specifications
- Photos/videos
- Site visit availability

Please contact me regarding this property.

Thank you,
${clientName}`;

  return buildWhatsAppUrl(message);
}
