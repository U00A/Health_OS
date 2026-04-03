export const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", 
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", 
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", 
  "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", 
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", 
  "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", 
  "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", 
  "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", 
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

// In a real application, this would have 1500+ communes explicitly mapped.
// We provide a fallback mock implementation for any given wilaya here.
export const getCommunesForWilaya = (wilaya: string): string[] => {
  return [
    `${wilaya} Centre`,
    `Sidi ${wilaya.substring(0, 3)}...`,
    `Aïn ${wilaya.substring(0, 3)}...`,
  ];
};
