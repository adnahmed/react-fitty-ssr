import fitty from 'fitty';
import React from 'react';

const fullWidth = { width: '100%' };

// todo support style and className on Wrapper(root div) and Ref div
// one solution could be adding style prop for root and another styleProp to ref

/**
 * Snugly resizes text to fit its parent container width
 */
export const ReactFitty = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode; minSize?: number; maxSize?: number; wrapText?: boolean }
>(function ReactFitty(
    { children, minSize = 12, maxSize = 512, wrapText = false, ...rest },
    ref: React.MutableRefObject<any> | ((instance: any) => void) | null
) {
    /* SSR */
    const [showChild, setShowChild] = useState(false);

    const internalRef = React.useRef<HTMLElement>(null);
    /**
     * Need to use the correct ref because the component ref can contain a className that dynamically
     * change the text size
     */
    const correctRef = ref || internalRef;
    // Wait until after client-side hydration to show
    React.useEffect(() => {
        setShowChild(true);
        const effectRef = (ref as React.MutableRefObject<HTMLDivElement>) || internalRef;

        const fitInstance = fitty(effectRef.current, {
            minSize: minSize,
            maxSize: maxSize,
            multiLine: wrapText,
            observeMutations: {
                subtree: true,
                childList: true,
                characterData: true,
                attributeFilter: ['class'],
            },
        }); // wait browser finish text width calc with relative properties like rem and %
        // then, fit text in the next animation frame
        // maybe that needed to be handled in fitty?

        setTimeout(() => {
            fitInstance.fit();
        }, 0);
        return () => {
            fitty(effectRef.current).unsubscribe();
        };
    }, [maxSize, minSize, ref, wrapText]);

    if (!showChild) {
        // You can show some kind of placeholder UI here
        return null;
    }

    // fitty need an extra div to avoid parent padding issue
    // see https://github.com/rikschennink/fitty/issues/20
    return (
        <div style={fullWidth}>
            <div {...rest} ref={correctRef as React.MutableRefObject<HTMLDivElement>}>
                {children}
            </div>
        </div>
    );
});
