EMAIL_BODIES = {
    "verification": {
        "school": """
                    <p>Heja {school_name}, Welcome to Aluta, a mapper for all things related to your school management.</p>
                    <p> With this email, we want to verify your business email is accessible to you. Seeing that you are here, click on the link below to let us verify your school account.</p>
                    <p><a href="{verification_link}">Click Me</a></p>

                    <p>From the kind people @ Aluta!</p>
                """,
        "user": """
                    <p>Yo {full_name}, Welcome to Aluta,</p>
                    <p> You have been added Aluta as a {member_type} of {school_name}.</p>
                    <p>Click on the link below to verify your account </p>
                    <p><a href='{verification_link}'>Click Me</a></p>
                    
                    <p>From the kind people @ Aluta!</p>
                """,
    },
    "verified": {
        "school": """
            <p>Looks like your school business account has been verified</p>
            <p>From the kind people @ Aluta!</p>
        """,
        "user": """
            <p>Looks like your email address has been verified. </p>
            <p>From the kind people @ Aluta!</p>
        """
    }
}
