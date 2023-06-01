export const DOTS = '...';
const getStartEndRange = (start: number, end: number) => {
  const length = end - start + 1;

  return Array.from({ length }, (_, idx) => idx + start);
};

const usePagination = (
  totalPageCount: number,
  siblingCount = 1,
  currentPage: number,
  screenDisplayCount = 3,
) => {
  const totalPageNumbers = siblingCount + 5;

  /*
    Case 1:
    If the number of pages is less than the page numbers we want to show in our
    paginationComponent, we return the range [1..totalPageCount]
  */
  if (totalPageNumbers >= totalPageCount) {
    return getStartEndRange(1, totalPageCount);
  }

  /*
    Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
  */
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount,
  );

  /*
    We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
  */
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

  const firstPageIndex = screenDisplayCount === 1 ? [1] : [1, 2];
  const lastPageIndex =
    screenDisplayCount === 1
      ? [totalPageCount]
      : [totalPageCount - 1, totalPageCount];

  /*
    Case 2: No left dots to show, but rights dots to be shown
  */
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = screenDisplayCount + 2 * siblingCount;
    let leftRange = getStartEndRange(1, leftItemCount);

    return [...leftRange, DOTS, ...lastPageIndex];
  }

  /*
      Case 3: No right dots to show, but left dots to be shown
    */
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = screenDisplayCount + 2 * siblingCount;
    let rightRange = getStartEndRange(
      totalPageCount - rightItemCount + 1,
      totalPageCount,
    );
    return [...firstPageIndex, DOTS, ...rightRange];
  }

  /*
      Case 4: Both left and right dots to be shown
    */
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = getStartEndRange(leftSiblingIndex, rightSiblingIndex);
    return [...firstPageIndex, DOTS, ...middleRange, DOTS, ...lastPageIndex];
  }
};

export default usePagination;
