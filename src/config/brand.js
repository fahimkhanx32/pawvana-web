// One place to rebrand the whole storefront.
export const BRAND = {
  name: 'Pawvana',
  tagline: 'Premium pet care',
  currency: '৳',
  supportEmail: 'hello@pawvana.com',
  supportPhone: '+880 1700-000000',
  city: 'Dhaka, Bangladesh',
  // The backend trusts the shipping number it receives, so these are the only
  // fees the checkout can send. Edit freely.
  shippingOptions: [
    { id: 'dhaka', label: 'Inside Dhaka', eta: '1–2 working days', fee: 60 },
    { id: 'outside', label: 'Outside Dhaka', eta: '3–5 working days', fee: 120 },
  ],
  divisions: ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'],
  lowStockAt: 5,
};
