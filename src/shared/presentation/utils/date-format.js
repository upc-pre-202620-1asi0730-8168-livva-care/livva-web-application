// Formats an ISO date (YYYY-MM-DD) or date-time for display. Optional or malformed
// values return a dash instead of throwing, because a RangeError during rendering
// leaves the router stuck on the current view.
export const formatDisplayDate = (date, localeCode, options = {}) => {
    if (!date) {
        return '—';
    }

    const value = new Date(
        String(date).includes('T') ? date : `${date}T00:00:00`
    );

    if (Number.isNaN(value.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat(localeCode, options).format(value);
};
