import React from "react";
import ReactDOM from "react-dom";
import {
  createPopper as createCorePopper,
  Options,
  Instance,
} from "@popperjs/core";

const enabledEvent = {
  clickTarget: "click-target",
  enterTarget: "enter-target",
} as const;

const disabledEvent = {
  leaveTarget: "leave-target",
} as const;

function useEvent(popper: CB, current?: CB) {
  return React.useMemo(() => {
    if (!current) return popper;

    return (event: any) => {
      popper(event);
      current(event);
    };
  }, [popper, current]);
}

/**
 * https://popper.js.org/docs/v2/tutorial
 */

export const Popper: Component = (_props) => {
  const {
    auto,
    enabled,
    enabledOn,
    disabledOn,
    portal,
    options,
    Content,
    children,
    ...rest
  } = _props;

  if (!React.isValidElement(children)) {
    throw new Error("invalid popper target");
  }

  const { type, props } = children;

  /**
   * maybe with the shipping reference it will be compatible
   * https://reactjs.org/docs/forwarding-refs.html
   */
  if (typeof type !== "string") {
    throw new Error("react component type (class or function) unsupported");
  }

  const target = React.useRef<HTMLElement>(null);

  const popper = React.useRef<HTMLElement>(null);

  const [active, setActive] = React.useState(false);

  const isAuto = auto !== undefined;

  const isManual = enabled !== undefined;

  const isEnabled = isManual ? enabled : active;

  React.useEffect(() => {
    if (!target.current || !popper.current || !isEnabled) {
      return;
    }

    let instance = createCorePopper(target.current, popper.current, options);

    /**
     * all ready to display the popper
     */
    popper.current.style.display = "";

    return () => {
      instance.destroy();
      instance = null as any;
    };
  });

  const show = React.useCallback(() => setActive(true), []);

  const hidden = React.useCallback(() => setActive(false), []);

  const setPopper = React.useCallback((ref: HTMLElement | null) => {
    if (!ref) return;

    /**
     * wait until the popper is ready to display
     */
    ref.style.display = "none";

    (popper as any).current = ref;
  }, []);

  /**
   * Events Handler
   */

  const onClick = useEvent(show, props.onClick);
  const onMouseEnter = useEvent(show, props.onMouseOver);
  const onMouseLeave = useEvent(hidden, props.onMouseOut);
  const onTouchStart = useEvent(show, props.onFocus);

  let _event: any = {};

  if (!isManual) {
    if (isAuto) {
      _event = { onMouseEnter, onMouseLeave, onTouchStart };
    } else {
      switch (enabledOn) {
        case enabledEvent.clickTarget: {
          _event.onClick = onClick;
          break;
        }
        case enabledEvent.enterTarget: {
          _event.onMouseEnter = onMouseEnter;
          break;
        }

        default:
          break;
      }
      switch (disabledOn) {
        case disabledEvent.leaveTarget: {
          _event.onMouseLeave = onMouseLeave;
          break;
        }

        default:
          break;
      }
    }
  }

  /**
   * Create new instance target
   */

  let propsTarget: any = {
    ...props,
    ..._event,
    key: props?.key || "_target",
    ref: target,
  };

  const Target = React.createElement(type, propsTarget);

  if (!isEnabled) {
    return Target;
  }

  const Popper = React.createElement(Content, {
    ...rest,
    key: (rest as any).key || "_popper",
    popper: setPopper,
    close: hidden,
  });

  if (portal) {
    return React.createElement(React.Fragment, null, [
      Target,
      ReactDOM.createPortal(Popper, document.body),
    ]);
  }

  const child = Array.isArray(propsTarget.children)
    ? [...propsTarget.children, Popper]
    : [propsTarget.children, Popper];

  const style: React.CSSProperties = {
    ...propsTarget.style,
    position: "relative",
  };

  return React.createElement(type, {
    ...propsTarget,
    style,
    children: child,
  });
};

export const createPopper: Creator = (Content: any) => {
  let _options: Opt;

  const Current = function CreatePopper(props: any) {
    return React.createElement(Popper, {
      ...props,
      Content,
      options: _options,
    });
  };

  Current.options = (options: Opt) => {
    _options = options;
  };

  return Current;
};

export default Popper;

/**
 * Types
 */

type Opt = Partial<Options>;

type GetType<T> = T[keyof T];

export interface PropsContent {
  popper: (ref: HTMLElement | null) => void;
  close: () => void;
}

interface Props {
  auto?: boolean;
  enabled?: boolean;
  portal?: boolean;
  enabledOn?: GetType<typeof enabledEvent>;
  disabledOn?: GetType<typeof disabledEvent>;
  options?: Partial<Options>;
  Content: (props: PropsContent) => JSX.Element | null;
  children: React.ReactNode;
}

type Component = (props: Props) => JSX.Element | null;

type PipeProps = Omit<Props, "Content">;

type PropsPopper<T> = keyof Omit<T, keyof PropsContent> extends never
  ? PipeProps
  : PipeProps & Omit<T, keyof PropsContent>;

type Creator = <C extends PropsContent>(
  Content: (props: C) => JSX.Element | null
) => {
  (props: PropsPopper<C>): JSX.Element | null;
  options: (options: Opt) => void;
};

type CB = (...args: any) => void;
