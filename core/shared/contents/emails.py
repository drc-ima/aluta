EMAIL_BODIES = {
    "verification": {
        "school": {
            "text": """
                Heja {school_name}, Welcome to Aluta, a mapper for all things related to your school management.
                With this email, we want to verify your business email is accessible to you. Seeing that you are here, click on the link below to let us verify your school account.
                {verification_link}.
                From the kind people @ Aluta!
            """,
            "html": """
                <p>Heja {school_name}, Welcome to Aluta, a mapper for all things related to your school management.</p>
                <p>With this email, we want to verify your business email is accessible to you. Seeing that you are here, click on the link below to let us verify your school account.</p>
                <p><a href="{verification_link}">Click Me</a></p>

                <p>From the kind people @ Aluta!</p>
            """ 
        },
        "user": {
            "text": """
                Yo {full_name}, Welcome to Aluta, You have been added Aluta as a {member_type} of {school_name}.
                Click on the link below to verify your account.
                {verification_link}.
                From the kind people @ Aluta!
            """,
            "html": """
                <p>Yo {full_name}, Welcome to Aluta,</p>
                <p> You have been added Aluta as a {member_type} of {school_name}.</p>
                <p>Click on the link below to verify your account.</p>
                <p><a href='{verification_link}'>Click Me</a></p>
                
                <p>From the kind people @ Aluta!</p>
            """
        },
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
    },
    "set-password": {
        "text": """
            Heylo {full_name}, You have requested to change your password.
            Click on the link below to do just that.
            {set_password_link}
            This link expires in 24 hours. If this action was not requested by you, you can just ignore it.

            From all the kind folks @ Aluta!
        """,
        "html": """
            <p>Heylo {full_name}, You have requested to change your password.</p>
            <p>Click on the link below to do just that.</p>
            <p>{set_password_link}</p>
            <p>This link expires in 24 hours.</p>
            <p>If this action was not requested by you, you can just ignore it.</p>
            <p>From all the kind folks @ Aluta!</p>
        """
    }
}
