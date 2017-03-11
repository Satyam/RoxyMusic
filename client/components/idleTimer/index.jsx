/** Modified from :
 * React Idle Timer
 *
 * @author  Randy Lebeau
 * @class   IdleTimer
 *
 */

import { Component, PropTypes } from 'react';
import bindHandlers from '_utils/bindHandlers';

export default class IdleTimer extends Component {

  constructor(props) {
    super(props);
    bindHandlers(this);
    this.state = {
      idle: false,
      oldDate: Date.now(),
      lastActive: Date.now(),
      remainedWhenPaused: null,
      tId: null,
      pageX: null,
      pageY: null,
    };
  }

  componentDidMount() {
    if (typeof document === 'undefined') return;
    const el = this.props.element;
    this.props.events.forEach(ev => el.addEventListener(ev, this.onEventHandler));
    if (this.props.startOnLoad) this.reset();
  }

  componentWillUnmount() {
    clearTimeout(this.state.tId);
    if (typeof document === 'undefined') return;
    const el = this.props.element;
    this.props.events.forEach(ev => el.removeEventListener(ev, this.onEventHandler));
  }

  onToggleIdleStateHandler() {
    this.setState({
      idle: !this.state.idle,
    });
    const store = this.context.store;
    // Fire the appropriate action
    if (this.state.idle) {
      if (store && this.props.reduxIdleAction) {
        store.dispatch({
          type: this.props.reduxIdleAction,
        });
      }
      this.props.idleAction();
    } else {
      if (store && this.props.reduxActiveAction) {
        store.dispatch({
          type: this.props.reduxActiveAction,
        });
      }
      this.props.activeAction();
    }
  }

  onEventHandler(ev) {
    // If paused, ignore events
    if (this.state.remainedWhenPaused) return;

    // Mousemove event
    if (ev.type === 'mousemove') {
      // if coord are same, it didn't move
      if (ev.pageX === this.state.pageX && ev.pageY === this.state.pageY) return;
      // if coord don't exist how could it move
      if (typeof ev.pageX === 'undefined' && typeof ev.pageY === 'undefined') return;
      // under 200 ms is hard to do, and you would have to stop,
      // as continuous activity will bypass this
      if ((Date.now() - this.state.oldDate) < 200) return;
    }

    // clear any existing timeout
    clearTimeout(this.state.tId);

    // if the idle timer is enabled, flip
    if (this.state.idle) this.onToggleIdleStateHandler(ev);

    this.setState({
      lastActive: Date.now(), // store when user was last active
      pageX: ev.pageX, // update mouse coord
      pageY: ev.pageY,
      tId: setTimeout(this.onToggleIdleStateHandler, this.props.timeout), // set a new timeout
    });
  }

  /**
   * Time remaining before idle
   *
   * @return {Number} Milliseconds remaining
   *
   */
  getRemainingTime() {
    // If idle there is no time remaining
    if (this.state.idle) return 0;

    // If its paused just return that
    if (this.state.remainedWhenPaused != null) return this.state.remainedWhenPaused;

    // Determine remaining, if negative idle didn't finish flipping, just return 0
    let remaining = this.props.timeout - (Date.now() - this.state.lastActive);
    if (remaining < 0) {
      remaining = 0;
    }
    // If this is paused return that number, else return current remaining
    return remaining;
  }

  /**
   * How much time has elapsed
   *
   * @return {Timestamp}
   *
   */
  getElapsedTime() {
    return Date.now() - this.state.oldDate;
  }

  /**
   * Last time the user was active
   *
   * @return {Timestamp}
   *
   */
  getLastActiveTime() {
    return this.state.lastActive;
  }

  /**
   * Restore initial settings and restart timer
   *
   * @return {Void}
   *
   */

  reset() {
    clearTimeout(this.state.tId);

    // reset settings
    this.setState({
      idle: false,
      oldDate: Date.now(),
      lastActive: this.state.oldDate,
      remainedWhenPaused: null,
      tId: setTimeout(this.onToggleIdleStateHandler, this.props.timeout),
    });
  }

  /**
   * Store remaining time and stop timer.
   * You can pause from idle or active state.
   *
   * @return {Void}
   *
   */
  pause() {
    // this is already paused
    if (this.state.remainedWhenPaused !== null) return;

    // clear any existing timeout
    clearTimeout(this.state.tId);

    // define how much is left on the timer
    this.setState({
      remainedWhenPaused: this.props.timeout - (Date.now() - this.state.oldDate),
    });
  }

  /**
   * Resumes a stopped timer
   *
   * @return {Void}
   *
   */
  resume() {
    // this isn't paused yet
    if (this.state.remainedWhenPaused === null) return;

    // start timer and clear remainedWhenPaused
    if (!this.state.idle) {
      this.setState({
        tId: setTimeout(this.onToggleIdleStateHandler, this.state.remainedWhenPaused),
        remainedWhenPaused: null,
      });
    }
  }

  /**
   * Is the user idle
   *
   * @return {Boolean}
   *
   */
  isIdle() {
    return this.state.idle;
  }

  render() {
    return this.props.children || null;
  }

}

IdleTimer.propTypes = {
  timeout: PropTypes.number, // Activity timeout
  events: PropTypes.arrayOf(PropTypes.string), // Activity events to bind
  idleAction: PropTypes.func, // Action to call when user becomes inactive
  activeAction: PropTypes.func, // Action to call when user becomes active
  element: PropTypes.any, // Element ref to watch activty on
  startOnLoad: PropTypes.bool,
  children: PropTypes.element,
  reduxIdleAction: PropTypes.string,
  reduxActiveAction: PropTypes.string,
};

IdleTimer.defaultProps = {
  timeout: 1000 * 60 * 20, // 20 minutes
  events: [
    'mousemove',
    'keydown',
    'wheel',
    'DOMMouseScroll',
    'mouseWheel',
    'mousedown',
    'touchstart',
    'touchmove',
    'MSPointerDown',
    'MSPointerMove',
  ],
  idleAction: () => {},
  activeAction: () => {},
  element: (typeof document !== 'undefined') && document,
  startOnLoad: true,
  reduxIdleAction: null,
  reduxActiveAction: null,
};

IdleTimer.contextTypes = {
  store: PropTypes.object,
};
