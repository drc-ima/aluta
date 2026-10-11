
import string, secrets


def generate_domain(name: str) -> str:

    slug = name.lower().replace(" ", "_")

    lower = string.ascii_lowercase
    digits = string.digits
    pool = [
        secrets.choice(lower),
        secrets.choice(digits)
    ]

    all_chars = lower + digits

    pool += [secrets.choice(all_chars) for _ in range(5)]

    secrets.SystemRandom().shuffle(pool)

    schuffled = "".join(pool)

    joined = slug + "_" + schuffled + "@aluta"

    return joined