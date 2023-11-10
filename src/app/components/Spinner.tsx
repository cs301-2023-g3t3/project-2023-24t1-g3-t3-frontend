
interface props {
    size: number;
}

const Spinner = ({ size }: props) => {
    return (
        <div className="flex justify-center items-center">
            <div className={ `animate-spin rounded-full ${"h-" + size} ${"w-" + size} border-b border-black` } />
        </div>
    );
}

export default Spinner;