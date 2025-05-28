class DateUtils {

  /**
   * return the formatted date with target format.
   * @param {string|date object} date
   * @param {string} format
   * @returns formatted date
   */
  static format(date, format) {
    const dateObject = this.getValidDate(date);
    if (!dateObject) {
      return '';
    }
    const upperCaseFormat = format && format.toUpperCase();
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();
    const displayMonth = month < 10 ? `0${month}` : month;
    const displayDay = day < 10 ? `0${day}` : day;
    switch (upperCaseFormat) {
      case 'YYYY-MM-DD HH:MM:SS': {
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const seconds = dateObject.getSeconds();
        const disPlayHours = hours < 10 ? `0${hours}` : hours;
        const disPlayMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const disPlaySeconds = seconds < 10 ? `0${seconds}` : seconds;
        return `${year}-${displayMonth}-${displayDay} ${disPlayHours}:${disPlayMinutes}:${disPlaySeconds}`;
      }
      case 'YYYY-MM-DD HH:MM': {
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const disPlayHours = hours < 10 ? `0${hours}` : hours;
        const disPlayMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${year}-${displayMonth}-${displayDay} ${disPlayHours}:${disPlayMinutes}`;
      }
      default: {
        return `${year}-${displayMonth}-${displayDay}`;
      }
    }
  }

  static isValidDateObject(dateObject) {
    return dateObject instanceof Date && !isNaN(dateObject.getTime());
  }

  static getValidDate(date) {
    if (!date) {
      return null;
    }
    const isDateTypeString = typeof date === 'string';
    let dateString = date;
    let dateObject = date;
    if (isDateTypeString) {
      if (dateString.split(' ').length > 1 || dateString.includes('T')) {
        dateObject = new Date(date);
      } else {
        // given date is without time precision
        dateString = `${date} 00:00:00`;
        dateObject = new Date(dateString);
      }
    }
    if (this.isValidDateObject(dateObject)) return dateObject;
    if (!isDateTypeString) return null;

    // ios phone and safari browser not support use '2021-09-10 12:30', support '2021/09/10 12:30'
    dateObject = new Date(dateString.replace(/-/g, '/'));
    if (this.isValidDateObject(dateObject)) return dateObject;
    return null;
  }

}

export default DateUtils;
