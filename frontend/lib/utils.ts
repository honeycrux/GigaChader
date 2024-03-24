

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    
    // Format the time
    const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Format the date
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Combine the formatted time and date
    const formattedDateTime = `${time} - ${formattedDate}`;
    
    return formattedDateTime;
}