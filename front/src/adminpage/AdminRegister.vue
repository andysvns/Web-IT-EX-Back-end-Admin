<template>
    <div class="main-warper">
        <v-container fluid class="fill-height bg-deep-blue">
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="4">
                    <div class="card-warper">
                        <v-card-title class="text-h2 white--text text-center justify-center mb-4 font-weight-regular">
                            Register
                        </v-card-title>
                        <v-form>
                            <v-text-field v-model="fname" label="First Name" name="fname"
                                prepend-inner-icon="mdi-card-account-details-outline" type="text" color="white" dark outlined
                                class="mb-4 custom-text-field"></v-text-field>

                            <v-text-field v-model="lname" label="Last name" name="lname"
                                prepend-inner-icon="mdi-card-account-details" type="text" color="white" dark outlined
                                class="mb-4 custom-text-field"></v-text-field>

                            <v-text-field v-model="username" label="Username" name="User"
                                prepend-inner-icon="mdi-account" type="text" color="white" dark outlined
                                class="mb-4 custom-text-field"></v-text-field>

                            <v-text-field v-model="password" label="Password" name="password"
                                prepend-inner-icon="mdi-lock" color="white" dark outlined class="mb-4 custom-text-field"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword"></v-text-field>

                            <v-text-field v-model="confirmPassword" label="Confirm Password" name="confirmPassword"
                                prepend-inner-icon="mdi-lock" color="white" dark outlined class="mb-4 custom-text-field"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword"></v-text-field>

 
                            <v-row no-gutters class="align-center">
                                <v-spacer></v-spacer>
                                <v-col cols="6" class="text-right">
                                    <a href="/adminlogin" class="white--text custom-tologin">Go to Login</a>
                                </v-col>
                            </v-row>

                            <v-btn color="red custom-register" dark large block @click="register">
                                Register
                            </v-btn>
                        </v-form>
                    </div>
                </v-col>
            </v-row>
        </v-container>
        <img class="footer_login" src="../assets/admin_l.png" alt="" />
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "RegisterPage",
    data: () => ({
        username: "",
        password: "",
        fname: "",
        lname: "",
        confirmPassword: "",
        showPassword: false,
        loading: false,
        errorMessage: "",
    }),
    methods: {
        async register() {
            this.loading = true;
            this.errorMessage = "";

            // Check if passwords match
            if (this.password !== this.confirmPassword) {
                this.errorMessage = "Passwords do not match.";
                this.loading = false;
                return;
            }

            try {
                const response = await axios.post("http://localhost:3000/authen/register", {
                    username: this.username,
                    password: this.password,
                    confirmpassword: this.confirmPassword,
                    fname: this.fname,
                    lname: this.lname,
                });

                if (response.data.success) {
                    console.log("Registration successful");
                    // Redirect to login page or another page
                    this.$router.push({ name: "AdminLogin" });
                } else {
                    this.errorMessage = response.data.message || "Registration failed";
                }
            } catch (error) {
                console.error("Registration error:", error.response || error);
                this.errorMessage =
                    error.response?.data?.message || "An error occurred during registration";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>


<style lang="scss" scoped>
.main-warper {
    background-color: #002140;
    height: 100vh;
}

.bg-deep-blue {
    background-color: #001F3F !important;
    // margin-top: -50px;
}

.bg-input {
    background-color: #224957;
}

.card-warper {
    // width: 25vw;
    padding-left: 10%;
    padding-right: 10%;
    margin-top: -100px;
}

.v-input__control {
    border-radius: 50px;
    /* This adds the border radius */
    background-color: #224957;
}

.footer_login {
    position: absolute;
    bottom: 0;
    width: 100vw;
    z-index: 1;
    // opacity: 0.5;
}

.custom-text-field ::v-deep .v-input__slot {
    background-color: #224957;
    /* light blue background color */
}

.custom-tologin {
    text-decoration: none;
}

.custom-register {
    margin-top: 15px;
}

@media only screen and (max-width: 1200px) {
    .card-warper {

        padding-left: 0;
        padding-right: 0;
    }
}
</style>