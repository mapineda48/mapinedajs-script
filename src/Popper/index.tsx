import React from "react";
import ReactDOM from "react-dom";
import { createPopper as createCorePopper, Options } from "@popperjs/core";

function useEvent(popper: CB, current?: CB) {
  return React.useCallback(
    (event) => {
      popper(event);
      if (current) current(event);
    },
    [popper, current]
  );
}

/**
 * https://popper.js.org/docs/v2/tutorial
 */

export const Popper: Component = (_props) => {
  const {
    portal,
    enabled = "auto",
    Content,
    children,
    onClickClose = false,
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
    throw new Error("react component type (a class or a function) unsupported");
  }

  const target = React.useRef<HTMLElement>(null);

  const popper = React.useRef<HTMLElement>(null);

  const options = React.useRef<Partial<Options>>({});

  const cb = React.useRef<any>(null);

  const [active, setActive] = React.useState(false);

  const isEnabled = typeof enabled === "boolean" ? enabled : active;

  React.useEffect(() => {
    if (!target.current || !popper.current || !isEnabled) {
      return;
    }

    const instance = createCorePopper(
      target.current,
      popper.current,
      options.current
    );

    /**
     * all ready to display the popper
     */
    popper.current.style.display = "";

    if (cb.current) cb.current(popper.current, target.current);

    return () => instance.destroy();
  });

  const show = React.useCallback(() => setActive(true), []);

  const hidden = React.useCallback(() => setActive(false), []);

  const afterWrite = React.useCallback((callback: CallBackEffect) => {
    cb.current = callback;
  }, []);

  const setOptions = React.useCallback((opt: Opt) => {
    options.current = opt;
  }, []);

  const setPopper = React.useCallback((ref: HTMLElement | null) => {
    if (!ref) return;

    /**
     * wait until the popper is ready to display
     */
    ref.style.display = "none";

    (popper as any).current = ref;
  }, []);

  const click = React.useCallback(({ target }: any) => {
    if (popper.current?.contains(target)) setActive(false);
  }, []);

  const onMouseEnter = useEvent(show, props.onMouseOver);
  const onMouseLeave = useEvent(hidden, props.onMouseOut);
  const onTouchStart = useEvent(show, props.onFocus);
  const onClick = useEvent(click, props.onClick);

  let propsTarget: any = {
    ...props,
    key: props?.key || "_target",
    ref: target,
  };

  if (enabled === "auto") {
    propsTarget = {
      ...propsTarget,
      onMouseEnter,
      onMouseLeave,
      onTouchStart,
    };

    if (onClickClose) {
      propsTarget = {
        ...propsTarget,
        onClick,
      };
    }
  }

  const Target = React.createElement(type, propsTarget);

  if (!isEnabled) {
    return Target;
  }

  const propsPopper = {
    ...rest,
    key: (rest as any).key || "_popper",
    popper: setPopper,
    afterWrite,
    setOptions,
    closeIt: hidden,
  };

  const Popper = React.createElement(Content, propsPopper);

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
  return (props: any) => {
    return React.createElement(Popper, { ...props, Content });
  };
};

export default Popper;

/**
 * Types
 */

type CallBackEffect = (popper: HTMLElement, target: HTMLElement) => void;

type Opt = Partial<Options>;

export interface PropsContent {
  popper: (ref: HTMLElement | null) => void;
  setOptions: (options: Opt) => void;
  closeIt: () => void;
  afterWrite: (cb: CallBackEffect) => void;
}

type EnabledPopper = boolean | "auto";

interface Props {
  portal?: boolean;
  enabled?: EnabledPopper;
  onClickClose?: boolean;
  Content: (props: PropsContent) => JSX.Element | null;
  children: React.ReactNode;
}

type Component = (props: Props) => JSX.Element | null;

type PropsPopper<T> = keyof Omit<T, keyof PropsContent> extends never
  ? Omit<Props, "Content">
  : Omit<Props, "Content"> & Omit<T, keyof PropsContent>;

type Creator = <C extends PropsContent>(
  Content: (props: C) => JSX.Element | null
) => (props: PropsPopper<C>) => JSX.Element | null;

type CB = (...args: any) => void;
