import PropTypes from 'prop-types';

const Header = ({ subtitle, title }) => {
    return (
        <div className="flex w-full justify-between">
            <div>
                <span className="text-xs font-semibold text-brand-gold">
                    {subtitle}
                </span>
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
        </div>
    );
};

Header.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Header;
