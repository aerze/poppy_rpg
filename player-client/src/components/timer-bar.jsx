import React from "react";

export class TimerBar extends React.Component {
  state = {
    running: true,
    value: 0,
  };

  max = 30000;
  endTime = null;

  componentDidMount() {
    console.log(">> props", this.props);
    this.initTimer();
  }

  componentWillUnmount() {}

  shouldComponentUpdate(nextProps) {
    if (this.max !== nextProps.max) {
      this.max = nextProps.max;
    }
    if (this.props.endAt !== nextProps.endAt) {
      this.initTimer(nextProps.endAt);
    }

    return true;
  }

  initTimer = (endAt) => {
    if (!endAt) return;
    this.endTime = endAt;
    this.setState({ running: true }, () => {
      setTimeout(this.updateTimer, 0);
    });
  };

  updateTimer = () => {
    if (!this.state.running) return;
    const value = Math.max(this.endTime - Date.now(), 0);
    const running = value > 0;

    this.setState({
      value,
      running,
    });

    if (running) {
      setTimeout(this.updateTimer, 16);
    }
  };

  render() {
    const { className } = this.props;
    const { value } = this.state;
    return <progress className={className} max={this.max} value={value} />;
  }
}
