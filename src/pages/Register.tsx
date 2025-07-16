import SignUpForm from '@/components/SignUpForm';
import AuthLayout from '@/components/AuthLayout';

const Register = () => {
  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold">Create an Account</h1>
      <p className="text-balance text-muted-foreground">
        Join the community of the best student filmmakers.
      </p>
      <div className="text-left">
        <SignUpForm />
      </div>
    </AuthLayout>
  );
};

export default Register;