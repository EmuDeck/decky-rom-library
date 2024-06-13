import { CSSProperties, VFC } from "react";

interface PlguinIconProps {
  size?: string;
  style?: CSSProperties;
}

export const PluginIcon: VFC<PlguinIconProps> = ({ size, style }) => {
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 54 60"
      fill="currentColor"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M52 0.5H2C1.60218 0.5 1.22064 0.658035 0.93934 0.93934C0.658035 1.22064 0.5 1.60218 0.5 2V50C0.5 50.3978 0.658035 50.7794 0.93934 51.0607C1.22064 51.342 1.60218 51.5 2 51.5H8.5V58C8.5 58.3978 8.65804 58.7794 8.93934 59.0607C9.22064 59.342 9.60218 59.5 10 59.5H44C44.3978 59.5 44.7794 59.342 45.0607 59.0607C45.342 58.7794 45.5 58.3978 45.5 58V51.5H52C52.3978 51.5 52.7794 51.342 53.0607 51.0607C53.342 50.7794 53.5 50.3978 53.5 50V2C53.5 1.60218 53.342 1.22064 53.0607 0.93934C52.7794 0.658035 52.3978 0.5 52 0.5ZM38.29 28.5V11.5H50.5V28.5H38.29ZM9.77 3.5H19.18V7.5H9.77V3.5ZM9.77 10.5H19.18V14.5H9.77V10.5ZM9.77 17.5H19.18V21.5H9.77V17.5ZM9.77 24.5H19.18V28.5H9.77V24.5ZM9.77 31.5H19.18V35.5H9.77V31.5ZM35.29 56.5H22.18V51.5H35.29V56.5Z"
        fill="currentColor"
      />
    </svg>
  );
};
