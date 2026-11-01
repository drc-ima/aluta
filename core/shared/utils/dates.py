from datetime import date


def is_range_inside(inner_start: date, inner_end: date, outer_start: date, outer_end: date):
    # Check if the inner range is completely inside the outer range
    return outer_start <= inner_start and inner_end <= outer_end