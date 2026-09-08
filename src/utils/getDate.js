export const getDate = () => {
  const now = new Date();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return {
    // date: 7,
    date: now.getDate(),
    month: months[now.getMonth()],
    year: now.getFullYear(),
    day: days[now.getDay()],
  };
};
