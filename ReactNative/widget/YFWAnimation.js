/**
 * Created by nw on 2018-10-08.
 */

export default function YFWAnimation(option) {
    this.animate = this.animate.bind(this);
    this.start = this.start.bind(this);
    this.option = option;
}

YFWAnimation.prototype.animate = function (now) {
    const {
        start,
        end,
        duration,
        onAnimationFrame,
        onAnimationEnd,
        easingFunc = this.defaultEasing
    } = this.option;

    let currentDuration = now - this.startTime;
    if (currentDuration >= duration) {
        onAnimationFrame(end);
        onAnimationEnd();
        return;
    }
    let value;
    if (start > end) {
        value = start - (start - end) * easingFunc(currentDuration / duration);
    } else {
        value = (end - start) * easingFunc(currentDuration / duration) + start;
    }
    onAnimationFrame(value);
    requestAnimationFrame(this.animate);
};

YFWAnimation.prototype.start = function (time) {
    this.startTime = new Date();
    this.animate(time || this.startTime);
};

YFWAnimation.prototype.defaultEasing = t => t;
