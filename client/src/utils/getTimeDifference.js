export default function getTimeDifference(date) {
  let time = Date.now() - date.getTime();
  time = parseInt(time / 1000);

  if (time < 60) return "الآن";

  time = parseInt(time / 60);
  if (time < 60) return `منذ ${time}د`;
  time = parseInt(time / 60);
  if (time < 24) return `منذ ${time}س`;
  time = parseInt(time / 24);
  if (time < 30) return `منذ ${time}ي`;
  time = parseInt(time / 30);
  if (time < 12) return `منذ ${time}ش`;
  return `منذ ${time}س`;
}
