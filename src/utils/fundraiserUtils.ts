
export const getDonationText = (fundraiser: any, fundraiserStats: any) => {
  if (!fundraiser) return '';
  
  let donationText = '';
  if (fundraiser.donation_type === 'percentage') {
    donationText = `${fundraiser.donation_percentage}% of each item purchase (excluding shipping) is donated to ${fundraiser.title}`;
  } else {
    const donationAmount = fundraiser.donation_amount || 0;
    donationText = `$${donationAmount.toFixed(2)} of each item bought is donated to ${fundraiser.title}`;
  }
  
  return donationText;
};
