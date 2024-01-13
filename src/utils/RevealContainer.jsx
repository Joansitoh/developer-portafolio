// REACT COMPONENTS
import React from "react";
import Reveal from "./Reveal";

function RevealContainer({ children, increase = 0.05, delay = 0.2 }) {
  const addDelayToReveals = (children, depth = 0) => {
    if (depth > 5) {
      return children;
    }

    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      let childWithDelay = child;

      if (child.type === Reveal) {
        delay += increase;
        childWithDelay = React.cloneElement(child, { customDelay: delay });
      }

      if (child.props.children) {
        childWithDelay = React.cloneElement(childWithDelay, {
          children: addDelayToReveals(child.props.children, depth + 1),
        });
      }

      return childWithDelay;
    });
  };

  return <>{addDelayToReveals(children)}</>;
}

export default RevealContainer;
