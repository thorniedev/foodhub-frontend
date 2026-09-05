"use client";

import { motion } from "motion/react";
import {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  type FocusEvent,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import {
  handleTabListFocusCapture,
  handleTabListKeyDown,
  tabFocusClass,
  useTabSelection,
} from "./shared";

const INDICATOR_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.5,
};

const LABEL_TRANSITION = {
  duration: 0.2,
  ease: [0.32, 0.72, 0, 1] as const,
};

type FluidTabsContextValue = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
};

const FluidTabsContext = createContext<FluidTabsContextValue | null>(null);

type FluidTabSlotContextValue = {
  index: number;
};

const FluidTabSlotContext = createContext<FluidTabSlotContextValue | null>(
  null,
);

function useFluidTabs() {
  const context = useContext(FluidTabsContext);

  if (!context) {
    throw new Error("FluidTabs primitives must be used within <FluidTabs>.");
  }

  return context;
}

function useFluidTabSlot() {
  const context = useContext(FluidTabSlotContext);

  if (!context) {
    throw new Error(
      "FluidTabs.Tab must be a direct child of <FluidTabs.List>.",
    );
  }

  return context;
}

type FluidTabsRootProps = {
  children: ReactNode;
  defaultActiveIndex?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
};

function FluidTabsRoot({
  children,
  defaultActiveIndex = 0,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  className,
}: FluidTabsRootProps) {
  const { activeIndex, setActiveIndex, focusedIndex, setFocusedIndex } =
    useTabSelection({
      defaultActiveIndex,
      activeIndex: activeIndexProp,
      onActiveIndexChange,
    });

  return (
    <FluidTabsContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        focusedIndex,
        setFocusedIndex,
      }}
    >
      <div
        className={cn(
          "flex w-full max-w-md items-center justify-center",
          className,
        )}
      >
        {children}
      </div>
    </FluidTabsContext.Provider>
  );
}

type FluidTabsListProps = ComponentPropsWithoutRef<"nav"> & {
  "aria-label"?: string;
};

type IndicatorState = {
  x: number;
  width: number;
  visible: boolean;
};

function FluidTabsList({
  className,
  children,
  "aria-label": ariaLabel = "Tabs",
  onKeyDown,
  onFocusCapture,
  ...props
}: FluidTabsListProps) {
  const { activeIndex, setActiveIndex, setFocusedIndex } = useFluidTabs();

  const listRef = useRef<HTMLElement>(null);

  const tabs = Children.toArray(children).filter(isValidElement);
  const count = tabs.length;

  const [indicator, setIndicator] = useState<IndicatorState>({
    x: 0,
    width: 0,
    visible: false,
  });

  const updateIndicator = useCallback(() => {
    const list = listRef.current;

    if (!list) return;

    const activeTab = list.querySelector<HTMLButtonElement>(
      `[data-fluid-tab-index="${activeIndex}"]`,
    );

    if (!activeTab) {
      setIndicator((current) => ({
        ...current,
        visible: false,
      }));

      return;
    }

    const listRect = list.getBoundingClientRect();
    const activeTabRect = activeTab.getBoundingClientRect();

    setIndicator({
      x: activeTabRect.left - listRect.left,
      width: activeTabRect.width,
      visible: true,
    });
  }, [activeIndex]);

  const rafId = useRef<number | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      updateIndicator();
    });
  }, [updateIndicator]);

  useLayoutEffect(() => {
    scheduleUpdate();

    const list = listRef.current;
    if (!list) return;

    const resizeObserver = new ResizeObserver(() => {
      scheduleUpdate();
    });

    resizeObserver.observe(list);

    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [count, scheduleUpdate]);

  return (
    <nav
      ref={listRef}
      aria-label={ariaLabel}
      className={cn(
        "relative rounded-full bg-muted/60 p-1 shadow-sm",
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          x: indicator.x,
          width: indicator.width,
          opacity: indicator.visible ? 1 : 0,
        }}
        transition={INDICATOR_SPRING}
        className="pointer-events-none absolute bottom-1 left-0 top-1 rounded-full bg-background shadow-sm"
      />

      <div
        role="tablist"
        className="relative z-10 flex w-full gap-1"
        onFocusCapture={(event: FocusEvent<HTMLElement>) => {
          onFocusCapture?.(event);

          handleTabListFocusCapture(event, activeIndex, setFocusedIndex);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(event);

          if (!event.defaultPrevented) {
            handleTabListKeyDown(event, count, setActiveIndex, setFocusedIndex);
          }
        }}
      >
        {tabs.map((tab, index) => (
          <FluidTabSlotContext.Provider
            key={tab.key ?? index}
            value={{ index }}
          >
            {tab}
          </FluidTabSlotContext.Provider>
        ))}
      </div>
    </nav>
  );
}

function FluidTabsIcon({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 empty:hidden [&_svg]:size-[18px]",
        className,
      )}
      {...props}
    />
  );
}

function FluidTabsLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("whitespace-nowrap", className)} {...props} />;
}

type FluidTabsTabProps = ComponentPropsWithoutRef<"button"> & {
  label?: string;
};

function FluidTabsTab({
  className,
  children,
  label,
  onClick,
  onFocus,
  ...props
}: FluidTabsTabProps) {
  const { activeIndex, setActiveIndex, setFocusedIndex } = useFluidTabs();

  const { index } = useFluidTabSlot();

  const isSelected = activeIndex === index;

  return (
    <button
      type="button"
      role="tab"
      data-fluid-tab-index={index}
      aria-selected={isSelected}
      aria-current={isSelected ? "page" : undefined}
      {...(label ? { "aria-label": label } : {})}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          setActiveIndex(index);
        }
      }}
      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);

        if (!event.defaultPrevented) {
          setFocusedIndex(index);
        }
      }}
      className={cn(
        tabFocusClass("rounded-full"),
        "relative z-10 flex flex-1 cursor-pointer items-center justify-center",
        "px-4 py-2.5 text-[18px] font-semibold",
        "transition-colors duration-200",
        "motion-reduce:transition-none",
        isSelected
          ? "text-primary-800 dark:text-primary-dark dark:text-white"
          : "text-primary-700 hover:text-primary-900 dark:text-gray-300 dark:hover:text-white",
        className,
      )}
      {...props}
    >
      <motion.span
        initial={false}
        animate={{
          scale: isSelected ? 1 : 0.98,
        }}
        transition={LABEL_TRANSITION}
        className="relative z-10 inline-flex items-center justify-center gap-2"
      >
        {children}
      </motion.span>
    </button>
  );
}

const FluidTabs = Object.assign(FluidTabsRoot, {
  List: FluidTabsList,
  Tab: FluidTabsTab,
  Icon: FluidTabsIcon,
  Label: FluidTabsLabel,
});

export default FluidTabs;

export {
  FluidTabsIcon,
  FluidTabsLabel,
  FluidTabsList,
  FluidTabsRoot,
  FluidTabsTab,
  useFluidTabs,
};
