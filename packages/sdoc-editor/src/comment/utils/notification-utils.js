import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import context from '../../context';
dayjs.extend(relativeTime);

const PERMISSION_GRANTED = 'granted';

const notify = ($title, $options) => {
  const notification = new Notification($title, $options);

  // auto clear notifications
  const timer = setTimeout(notification.close.bind(notification), 5000);
  notification.onshow = function (event) {
    const mediaUrl = context.getSetting('mediaUrl');
    let newAudioElement = document.createElement('audio');
    newAudioElement.setAttribute('src', `${mediaUrl}audio/classic.mp3`);
    newAudioElement.setAttribute('autoplay', 'autoplay');
    newAudioElement.setAttribute('id', 'seatable-audio');

    let audioElement = document.getElementById('seatable-audio');
    if (audioElement) {
      document.body.removeChild(audioElement);
    }
    document.body.appendChild(newAudioElement);
  };

  notification.onclose = function () {
    clearTimeout(timer);
  };

  notification.onclick = function () {
    notification.close();
  };
};

export const createNotify = (title, options) => {

  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === PERMISSION_GRANTED) {
    notify(title, options);
  } else {
    Notification.requestPermission((res) => {
      if (res === PERMISSION_GRANTED) {
        notify(title, options);
      }
    });
  }
};

export const generatorNotificationKey = (commentId, replyId = '') => {
  const validCommentId = commentId + '';
  const validReplyId = replyId + '';

  if (!validReplyId) return `sdoc_notification_${validCommentId}`;
  return `sdoc_notification_${validCommentId}_${validReplyId}`;
};
